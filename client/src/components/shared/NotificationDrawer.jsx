import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FaBell, FaCheckDouble, FaSpinner, FaCircle, FaTimes } from "react-icons/fa";
import { getMyNotifications, markNotificationsAsRead } from "../../api/notificationEndPoints";
import { useAuth } from "../../context/AuthContext";

function timeAgo(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function NotificationDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await getMyNotifications();
      return res.data.data || [];
    },
    enabled: isOpen && !!user, // Only fetch when open
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    if (isOpen) {
      const hasUnread = notifications.some((n) => !n.isRead);
      if (hasUnread) {
        markReadMutation.mutate();
      }
    }
  }, [isOpen, notifications]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Sliding Drawer */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaBell className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up!"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => markReadMutation.mutate()}
                  disabled={unreadCount === 0 || markReadMutation.isPending}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  Mark Read
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin text-blue-500 w-8 h-8" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-16">
                  <FaBell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-medium text-gray-700">No notifications</h3>
                  <p className="text-gray-500 text-xs mt-1">Updates will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 rounded-2xl shadow-sm border ${
                        !notif.isRead
                          ? "bg-white border-blue-100 ring-1 ring-blue-50"
                          : "bg-gray-50 border-gray-100 text-opacity-70"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {!notif.isRead ? (
                            <FaCircle className="w-2.5 h-2.5 text-blue-500" />
                          ) : (
                            <FaCheckDouble className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <h4
                              className={`text-sm leading-tight ${
                                !notif.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-600"
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap pt-0.5">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-1 leading-relaxed ${
                              !notif.isRead ? "text-gray-700" : "text-gray-500"
                            }`}
                          >
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

