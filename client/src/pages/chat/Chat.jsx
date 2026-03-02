// pages/Chat.jsx  (shared — both resident and provider use this)
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { getChatMessages } from "../../api/chatEndPoints";
import {
  FaArrowLeft, FaCircle, FaPaperPlane,
  FaSpinner, FaUser, FaCheckDouble, FaCheck,
} from "react-icons/fa";

export default function Chat() {
  const { bookingId }   = useParams();
  const { user }        = useAuth();
  const { socket }      = useSocket();
  const navigate        = useNavigate();

  const [messages, setMessages]     = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [isTyping, setIsTyping]     = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* ── Load history + join socket room ── */
  useEffect(() => {
    if (!bookingId || !user) return;

    loadMessages();
    setupSocket();

    return () => {
      /* Leave room on unmount */
      socket?.emit("leave_chat", { bookingId });
    };
  }, [bookingId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await getChatMessages(bookingId);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    if (!socket) return;

    /* Join this booking's chat room */
    socket.emit("join_chat", { bookingId });
    setIsConnected(true);

    /* Receive new message */
    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        /* Avoid duplicates */
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      /* Mark as read if from other person */
      if (msg.senderId !== user._id && msg.senderId !== user.user_id) {
        socket.emit("mark_read", { bookingId });
      }
    });

    /* Typing indicator */
    socket.on("user_typing", ({ isTyping }) => {
      setOtherTyping(isTyping);
    });

    /* Messages read */
    socket.on("messages_read", () => {
      setMessages((prev) =>
        prev.map((m) => ({ ...m, isRead: true }))
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("messages_read");
    };
  };

  /* ── Send message ── */
  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || sending) return;

    setSending(true);
    socket.emit("send_message", {
      bookingId,
      message: text,
      messageType: "text",
    });

    /* Optimistic update */
    const optimistic = {
      _id:        `temp_${Date.now()}`,
      senderId:   user._id || user.user_id,
      senderRole: user.role,
      message:    text,
      messageType: "text",
      isRead:     false,
      createdAt:  new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");
    setSending(false);
    inputRef.current?.focus();
  };

  /* ── Typing indicator ── */
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket?.emit("typing", { bookingId, isTyping: true });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit("typing", { bookingId, isTyping: false });
    }, 1500);
  };

  /* ── Enter to send ── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Is this message mine? ── */
  const isMyMessage = (msg) => {
    const myId = user._id || user.user_id;
    return msg.senderId?.toString() === myId?.toString();
  };

  /* ── Format time ── */
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ── Group messages by date ── */
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500
                            to-indigo-600 flex items-center justify-center flex-shrink-0">
              <FaUser className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-sm">Job Chat</p>
              <div className="flex items-center gap-1.5">
                <FaCircle className={`w-2 h-2 ${
                  isConnected ? "text-green-500" : "text-gray-400"
                }`} />
                <p className="text-xs text-gray-500">
                  {otherTyping
                    ? "Typing..."
                    : isConnected
                    ? "Online"
                    : "Connecting..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-1">

          {loading ? (
            <div className="flex justify-center py-20">
              <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center
                              justify-center mx-auto mb-4">
                <FaPaperPlane className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-gray-500 text-sm">
                No messages yet. Say hello! 👋
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 bg-gray-100
                                   px-3 py-1 rounded-full font-medium">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {msgs.map((msg, index) => {
                  const mine      = isMyMessage(msg);
                  const prevMsg   = msgs[index - 1];
                  const isSameUser =
                    prevMsg && isMyMessage(prevMsg) === mine;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}
                                  ${isSameUser ? "mt-1" : "mt-3"}`}
                    >
                      {/* Avatar — other person, first in group */}
                      {!mine && !isSameUser && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br
                                        from-gray-400 to-gray-500 flex items-center
                                        justify-center flex-shrink-0 mr-2 self-end mb-1">
                          <FaUser className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {/* Spacer for grouped messages */}
                      {!mine && isSameUser && (
                        <div className="w-7 mr-2 flex-shrink-0" />
                      )}

                      <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"}
                                       flex flex-col`}>
                        {/* Bubble */}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                         ${mine
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                        } ${msg.optimistic ? "opacity-75" : ""}`}>
                          {msg.message}
                        </div>

                        {/* Time + read receipt */}
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${
                          mine ? "flex-row-reverse" : "flex-row"
                        }`}>
                          <span className="text-xs text-gray-400">
                            {formatTime(msg.createdAt)}
                          </span>
                          {mine && (
                            msg.isRead
                              ? <FaCheckDouble className="w-3 h-3 text-blue-500" />
                              : <FaCheck className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Typing bubble */}
          {otherTyping && (
            <div className="flex justify-start mt-2">
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3
                              shadow-sm border border-gray-100 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl
                          focus-within:border-blue-500 focus-within:bg-white
                          transition-all overflow-hidden">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              rows={1}
              className="w-full px-4 py-3 bg-transparent outline-none resize-none
                         text-sm text-gray-800 placeholder-gray-400 max-h-32"
              style={{ minHeight: "44px" }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className={`w-11 h-11 rounded-xl flex items-center justify-center
                        flex-shrink-0 transition-all ${
              newMessage.trim()
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {sending
              ? <FaSpinner className="w-4 h-4 animate-spin" />
              : <FaPaperPlane className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}