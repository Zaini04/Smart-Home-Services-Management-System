import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { getMyConversations, getChatMessages, uploadChatFile } from "../../api/chatEndPoints";
import { buildMediaUrl, getApiBaseUrl } from "../../utils/url";
import {
  FaArrowLeft, FaComments, FaUser, FaCheckDouble, FaCheck,
  FaPaperPlane, FaPaperclip, FaSpinner, FaTools, FaTimes, FaImage, FaVideo
} from "react-icons/fa";
import { useSocket } from "../../context/SocketContext";

function formatTime(date) {
  if (!date) return "";
  const msgDate = new Date(date);
  const diffMins = Math.floor((new Date() - msgDate) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatContainer() {
  const { user } = useAuth();
  const { bookingId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const queryClient = useQueryClient();
  const apiBaseUrl = getApiBaseUrl();

  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  
  // File Preview States
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Routing Logic
  const isProviderRoute = location.pathname.includes("/provider");
  const chatPrefix = isProviderRoute ? "/provider/chat" : "/chat";
  const jobPrefix = isProviderRoute ? "/provider/job" : "/booking";
  const dashboardRoute = isProviderRoute ? "/provider/dashboard" : "/my-bookings";

  const handleBackToDashboard = () => navigate(dashboardRoute);
  const handleBackToList = () => navigate(chatPrefix);
  const handleUserClick = (id) => navigate(`${chatPrefix}/${id}`);
  const handleGoToJob = (id) => navigate(`${jobPrefix}/${id}`);

  // 1. Fetch Inbox list
  const { data: conversations = [], isLoading: loadingInbox } = useQuery({
    queryKey: ["chatInbox"],
    queryFn: async () => {
      const res = await getMyConversations();
      return res.data.data || [];
    },
    enabled: !!user,
  });

  const activeConv = conversations.find(c => c.bookingId === bookingId);

  // 2. Fetch Messages Safely
  // 🌟 FIX 1: Removed the '= []' to stop the infinite loop bug!
  const { data: fetchedMessages, isFetching: loadingMessages } = useQuery({
    queryKey: ["chatMessages", bookingId],
    queryFn: async () => {
      const res = await getChatMessages(bookingId);
      return res.data.data || [];
    },
    enabled: !!bookingId, 
  });

  // 🌟 FIX 2: Safely update local state without looping
  useEffect(() => {
    if (!bookingId) {
      setMessages([]);
    } else if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages, bookingId]);

  // 3. Global Socket is now used from context
  useEffect(() => {
    if (!socket) return;
    socket.on("data_updated", () => queryClient.invalidateQueries({ queryKey: ["chatInbox"] }));
    return () => {
      socket.off("data_updated");
    };
  }, [socket, queryClient]);

  // 4. Handle Active Chat Room Events
  useEffect(() => {
    if (!socket || !bookingId) return;

    socket.emit("join_chat", { bookingId });

    const handleReceive = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (msg.senderId !== user._id && msg.senderId !== user.user_id) {
        socket.emit("mark_read", { bookingId });
        queryClient.invalidateQueries({ queryKey: ["chatInbox"] });
      }
      scrollToBottom();
    };

    socket.on("receive_message", handleReceive);
    socket.on("user_typing", ({ isTyping }) => setOtherTyping(isTyping));
    socket.on("messages_read", () => setMessages(prev => prev.map(m => ({ ...m, isRead: true }))));

    // Listen for online status changes
    const handleStatusChange = ({ userId, status }) => {
      // Check if this status update is for our current chat partner
      const currentPartnerId = activeConv?.otherPerson?._id || activeConv?.otherPerson?.id;
      if (userId?.toString() === currentPartnerId?.toString()) {
        setIsOtherOnline(status === "online");
      }
      // Always refresh the inbox list to show status updates for others
      queryClient.invalidateQueries({ queryKey: ["chatInbox"] });
    };

    socket.on("user_status_changed", handleStatusChange);

    // Initial check for online status
    const otherUserId = activeConv?.otherPerson?.id || activeConv?.otherPerson?._id;
    if (otherUserId && socket) {
      socket.emit("check_online_status", { userId: otherUserId.toString() }, (res) => {
        setIsOtherOnline(res?.isOnline || false);
      });
    }

    return () => {
      socket.emit("leave_chat", { bookingId });
      socket.off("receive_message", handleReceive);
      socket.off("user_typing");
      socket.off("messages_read");
      socket.off("user_status_changed", handleStatusChange);
    };
  }, [socket, bookingId, user, queryClient, activeConv?.otherPerson?._id, activeConv?.otherPerson?.id]);

  // Mark as read when bookingId changes (chat opened)
  useEffect(() => {
    if (socket && bookingId) {
      socket.emit("mark_read", { bookingId });
      queryClient.invalidateQueries({ queryKey: ["chatInbox"] });
    }
    // Temporarily reset online status when switching chats
    setIsOtherOnline(false);
  }, [socket, bookingId, queryClient]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);
  
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Handlers ──
  const handleSend = async () => {
    const text = newMessage.trim();
    if ((!text && !selectedFile) || sending || !socket) return;
    
    setSending(true);
    try {
      let finalFileUrl = null;
      let finalFileType = "text";

      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await uploadChatFile(formData);
        finalFileUrl = res.data.data.fileUrl;
        finalFileType = fileType;
        setUploading(false);
      }

      socket.emit("send_message", { 
        bookingId, 
        message: text || (finalFileType === "video" ? "Sent a video" : "Sent an image"), 
        messageType: finalFileType,
        fileUrl: finalFileUrl
      });

      setNewMessage("");
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);
      queryClient.invalidateQueries({ queryKey: ["chatInbox"] }); 
    } catch (err) {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const type = file.type.startsWith("video/") ? "video" : "image";
    setFileType(type);
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit("typing", { bookingId, isTyping: true });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socket.emit("typing", { bookingId, isTyping: false }), 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isMyMessage = (msg) => {
    const myId = user._id || user.user_id;
    return msg.senderId?.toString() === myId?.toString();
  };

  const showSidebar = !bookingId; 
  const showChatArea = !!bookingId;
  const isChatClosed = ['completed', 'cancelled'].includes(activeConv?.status);

  return (
    <div className="flex h-screen md:h-[calc(100vh-64px)] bg-white overflow-hidden">
      
      {/* ── LEFT PANEL: INBOX ── */}
      <div className={`w-full md:w-[350px] lg:w-[400px] bg-white border-r border-gray-200 flex flex-col ${showSidebar ? "flex" : "hidden md:flex"}`}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={handleBackToDashboard} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Chats</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingInbox ? (
            <div className="py-10 text-center"><FaSpinner className="animate-spin text-blue-500 mx-auto" /></div>
          ) : conversations.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">No active chats</div>
          ) : (
            conversations.map((conv) => (
              <div key={conv.bookingId} onClick={() => handleUserClick(conv.bookingId)}
                className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all border ${
                  bookingId === conv.bookingId 
                    ? "bg-blue-50 border-blue-200" 
                    : "hover:bg-gray-50 border-transparent"
                } ${['completed', 'cancelled'].includes(conv.status) ? "opacity-60 grayscale-[0.3]" : ""}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0 relative">
                  {conv.otherPerson.image ? (
                     <img src={buildMediaUrl(conv.otherPerson.image)} className="w-full h-full object-cover" alt="avatar"/>
                  ) : <div className="w-full h-full flex items-center justify-center bg-blue-100"><FaUser className="text-blue-500" /></div>}
                  {conv.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">{conv.unreadCount}</div>}
                  {conv.otherPerson.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className={`font-bold text-sm truncate ${conv.unreadCount > 0 ? "text-blue-700" : "text-gray-900"}`}>
                      {conv.otherPerson.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium">{formatTime(conv.lastMessage?.time || conv.updatedAt)}</span>
                  </div>
                  
                  {/* Job ID & Category Badges */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                      #{conv.bookingDisplayId}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded capitalize ${
                      conv.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      conv.status === 'work_in_progress' ? 'bg-blue-100 text-blue-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {conv.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                    {conv.lastMessage ? (
                      <>
                        {conv.lastMessage.isFromMe && <span className="text-gray-400">You: </span>}
                        {conv.lastMessage.messageType === 'image' ? "📷 Image" : conv.lastMessage.messageType === 'video' ? "🎥 Video" : conv.lastMessage.text}
                      </>
                    ) : (
                      <span className="italic opacity-60">No messages yet</span>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: CHAT AREA ── */}
      <div className={`flex-1 flex flex-col bg-[#f0f2f5] relative ${showChatArea ? "flex" : "hidden md:flex"}`}>
        {bookingId ? (
          <>
            <div className="h-16 md:h-[72px] bg-white border-b border-gray-200 px-3 md:px-4 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <button onClick={handleBackToList} className="md:hidden p-1.5 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full">
                  <FaArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                   {activeConv?.otherPerson?.image ? <img src={buildMediaUrl(activeConv.otherPerson.image)} className="w-full h-full object-cover" alt="avatar"/> : <FaUser className="text-blue-500 w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 text-xs md:text-sm leading-tight flex items-center gap-1.5 truncate">
                    <span className="truncate">{activeConv?.otherPerson?.name || "Loading..." }</span>
                    <span className="hidden sm:inline-block text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono">#{activeConv?.bookingDisplayId}</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isOtherOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isOtherOnline ? "text-green-600" : "text-gray-400"}`}>
                      {otherTyping ? "Typing..." : isOtherOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => handleGoToJob(bookingId)} className="px-2 md:px-4 py-1.5 md:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] md:text-sm font-bold flex items-center gap-1.5 transition-all border border-blue-200 shadow-sm flex-shrink-0">
                <FaTools className="w-3 h-3 md:w-3.5 md:h-3.5" /> <span className="hidden xs:inline">Details</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-gray-400 w-8 h-8" /></div>
              ) : messages.length === 0 ? (
                <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl text-center max-w-sm mx-auto mt-10 shadow-sm border border-blue-100">
                  Start the conversation! Share issues, send photos, and click <b>"Job Dashboard"</b> above to request inspections or send prices.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const mine = isMyMessage(msg);
                  const showAvatar = !mine && (!messages[index - 1] || isMyMessage(messages[index - 1]));

                  return (
                    <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"} items-end gap-2`}>
                      {!mine && (
                        <div className={`w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ${showAvatar ? "bg-gray-300" : "invisible"}`}>
                           {activeConv?.otherPerson?.image ? <img src={buildMediaUrl(activeConv.otherPerson.image)} className="w-full h-full object-cover" alt="avatar"/> : <FaUser className="w-3 h-3 m-1.5 text-white" />}
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 text-[15px] shadow-sm relative ${mine ? "bg-blue-600 text-white rounded-2xl rounded-br-none" : "bg-white text-gray-800 rounded-2xl rounded-bl-none border border-gray-100"}`}>
                        
                        {msg.messageType === "image" && msg.fileUrl && (
                          <a href={buildMediaUrl(msg.fileUrl)} target="_blank" rel="noreferrer">
                            <img src={buildMediaUrl(msg.fileUrl)} className="w-full max-w-xs rounded-lg mb-2 border cursor-pointer hover:opacity-90" alt="attachment" />
                          </a>
                        )}
                        {msg.messageType === "video" && msg.fileUrl && (
                          <video controls className="w-full max-w-xs rounded-lg mb-2 border bg-black">
                            <source src={buildMediaUrl(msg.fileUrl)} type="video/mp4" />
                          </video>
                        )}

                        {msg.message && <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                        
                        <div className={`flex items-center justify-end gap-1 mt-1.5 -mb-0.5 ${mine ? "text-blue-100" : "text-gray-400"}`}>
                          <span className="text-[10px] font-medium">{formatTime(msg.createdAt)}</span>
                          {mine && (msg.isRead ? <FaCheckDouble className="text-white text-[10px]" /> : <FaCheck className="text-[10px] opacity-70" />)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {otherTyping && (
                <div className="flex justify-start items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-300 invisible" />
                  <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
          </div>

          {isChatClosed ? (
            <div className="bg-gray-100 p-5 flex items-center justify-center border-t border-gray-200 text-gray-500 font-medium shadow-inner">
              <FaCheckDouble className="w-5 h-5 mr-3 text-gray-400" />
              This job is marked as {activeConv?.status}. The chat has been closed.
            </div>
          ) : (
            <div className="bg-[#f0f2f5] p-2 md:p-3 flex flex-col gap-2 border-t border-gray-200">
              {/* File Preview Area */}
              {filePreview && (
                <div className="px-2 pt-2 animate-fadeIn">
                  <div className="relative inline-block">
                    {fileType === "image" ? (
                      <img src={filePreview} alt="preview" className="h-24 w-24 object-cover rounded-xl border-2 border-white shadow-md" />
                    ) : (
                      <div className="h-24 w-24 flex flex-col items-center justify-center bg-gray-800 rounded-xl border-2 border-white shadow-md text-white">
                        <FaVideo className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">VIDEO</span>
                      </div>
                    )}
                    <button onClick={removeFile} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2 max-w-full overflow-hidden">
                <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading || sending} className="p-3 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors flex-shrink-0">
                  <FaPaperclip className="w-5 h-5" />
                </button>
                
                <textarea 
                  value={newMessage} 
                  onChange={handleInputChange} 
                  onKeyDown={handleKeyDown} 
                  placeholder={filePreview ? "Add a caption..." : "Type a message"} 
                  rows={1} 
                  className="flex-1 max-h-32 min-h-[44px] bg-white rounded-2xl px-4 py-3 text-[15px] outline-none resize-none shadow-sm min-w-0" 
                />

                <button 
                  onClick={handleSend} 
                  disabled={(!newMessage.trim() && !selectedFile) || sending || uploading} 
                  className={`p-3 rounded-full flex-shrink-0 flex items-center justify-center transition-all w-[44px] h-[44px] ${
                    (newMessage.trim() || selectedFile) && !sending && !uploading 
                      ? "bg-blue-600 text-white shadow-md active:scale-95" 
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {sending || uploading ? <FaSpinner className="animate-spin w-5 h-5" /> : <FaPaperPlane className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
            </div>
          )}
        </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-sm mb-6"><FaComments className="w-12 h-12 text-blue-200" /></div>
            <h2 className="text-2xl font-light text-gray-500">ServiceConnect Chat</h2>
            <p className="mt-2 text-sm">Select a conversation from the left to start messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
}