import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyNotifications, markNotificationsAsRead } from "../api/notificationEndPoints"; // Adjust import path
import Navbar from "../components/Navbar";
import { FaBell, FaCheckDouble, FaSpinner, FaCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

// Time formatter
function timeAgo(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await getMyNotifications();
      return res.data.data || [];
    },
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Automatically mark as read when they open the page
  useEffect(() => {
    const hasUnread = notifications.some((n) => !n.isRead);
    if (hasUnread) {
      markReadMutation.mutate();
    }
  }, [notifications]);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
    {
      user.role === "resident" ? <Navbar /> : null
    }
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaBell className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                <p className="text-gray-500 text-sm">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => markReadMutation.mutate()}
              disabled={unreadCount === 0 || markReadMutation.isPending}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2 disabled:opacity-50"
            >
              <FaCheckDouble /> Mark all read
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <FaSpinner className="animate-spin text-blue-500 w-8 h-8" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16">
                <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700">No notifications yet</h3>
                <p className="text-gray-500 text-sm mt-1">When you get updates, they'll show up here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`p-5 transition-colors ${!notif.isRead ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {!notif.isRead ? (
                          <FaCircle className="w-3 h-3 text-blue-500" />
                        ) : (
                          <FaCheckDouble className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className={`text-base ${!notif.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm ${!notif.isRead ? "text-gray-800 font-medium" : "text-gray-600"}`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}