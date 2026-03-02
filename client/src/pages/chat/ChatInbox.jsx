// pages/chat/ChatInbox.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaArrowLeft,
  FaComments,
  FaSpinner,
  FaUser,
  FaCircle,
  FaChevronRight,
  FaCheckDouble,
  FaCheck,
} from "react-icons/fa";
import { getMyConversations } from "../../api/chatEndPoints";

/* ── Status Colors ── */
const statusColors = {
  inspection_pending: "bg-yellow-100 text-yellow-700",
  inspection_scheduled: "bg-orange-100 text-orange-700",
  awaiting_price_approval: "bg-amber-100 text-amber-700",
  price_approved: "bg-teal-100 text-teal-700",
  work_in_progress: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
};

const statusLabels = {
  inspection_pending: "Inspection",
  inspection_scheduled: "Scheduled",
  awaiting_price_approval: "Pricing",
  price_approved: "Approved",
  work_in_progress: "In Progress",
  completed: "Completed",
};

/* ── Time Formatter ── */
function formatTime(date) {
  if (!date) return "";
  
  const now = new Date();
  const msgDate = new Date(date);
  const diffMs = now - msgDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatInbox() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyConversations();
      setConversations(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Determine chat URL based on user role
  const getChatUrl = (bookingId) => {
    // If user is provider, use provider route, else resident route
    if (user.role === "service_provider") {
      return `/provider/chat/${bookingId}`;
    }
    return `/chat/${bookingId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800 text-lg">Messages</h1>
            <p className="text-xs text-gray-500">
              {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <FaSpinner className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading conversations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchConversations}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaComments className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Conversations Yet</h3>
            <p className="text-gray-500 text-sm">
              {user.role === "service_provider"
                ? "Conversations will appear here once you're assigned to a job."
                : "Conversations will appear here once you accept an offer."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link
                key={conv.bookingId}
                to={getChatUrl(conv.bookingId)}
                className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-gray-200">
                      {conv.otherPerson.image ? (
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}/${conv.otherPerson.image}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaUser className="w-6 h-6 text-blue-500" />
                        </div>
                      )}
                    </div>
                    {/* Online indicator (optional) */}
                    {conv.status === "work_in_progress" && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top Row: Name + Time */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`font-semibold text-gray-800 truncate ${
                        conv.unreadCount > 0 ? "text-gray-900" : ""
                      }`}>
                        {conv.otherPerson.name}
                      </h3>
                      <span className={`text-xs flex-shrink-0 ${
                        conv.unreadCount > 0 ? "text-blue-600 font-semibold" : "text-gray-400"
                      }`}>
                        {formatTime(conv.lastMessage?.time || conv.updatedAt)}
                      </span>
                    </div>

                    {/* Category + Status */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-blue-600 font-medium">
                        {conv.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        statusColors[conv.status] || "bg-gray-100 text-gray-600"
                      }`}>
                        {statusLabels[conv.status] || conv.status}
                      </span>
                    </div>

                    {/* Last Message */}
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate flex-1 ${
                        conv.unreadCount > 0 
                          ? "text-gray-800 font-medium" 
                          : "text-gray-500"
                      }`}>
                        {conv.lastMessage ? (
                          <>
                            {conv.lastMessage.isFromMe && (
                              <span className="text-gray-400 mr-1">You:</span>
                            )}
                            {conv.lastMessage.text || "Started conversation"}
                          </>
                        ) : (
                          <span className="italic text-gray-400">No messages yet</span>
                        )}
                      </p>

                      {/* Unread Badge OR Read Receipt */}
                      {conv.unreadCount > 0 ? (
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      ) : conv.lastMessage?.isFromMe ? (
                        <FaCheckDouble className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      ) : null}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center">
                    <FaChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}