import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getSupportTickets, replySupportTicket, deleteSupportTicket } from "../../api/adminEndPoints";
import { FaTrash, FaSpinner, FaEnvelope, FaCheckCircle, FaReply, FaHeadset, FaGlobe, FaComments } from "react-icons/fa";

// Tab config — each tab maps to specific API params
const TABS = [
  { key: "all",          label: "All Messages",   icon: FaComments, params: {} },
  { key: "contact_us",   label: "Contact Us",      icon: FaGlobe,    params: { source: "contact_us" } },
  { key: "help_support", label: "Help & Support",  icon: FaHeadset,  params: { source: "help_support" } },
  { key: "open",         label: "Open",            icon: null,       params: { status: "open" } },
  { key: "replied",      label: "Replied",         icon: null,       params: { status: "replied" } },
];

const SOURCE_BADGE = {
  contact_us:   { label: "Contact Us",    className: "bg-purple-100 text-purple-700" },
  help_support: { label: "Help & Support", className: "bg-blue-100 text-blue-700" },
};

export default function HelpSupportAdmin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const currentTab = TABS.find((t) => t.key === activeTab);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["supportTickets", activeTab],
    queryFn: async () => {
      const res = await getSupportTickets(currentTab?.params || {});
      return res.data?.data || [];
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, text }) => replySupportTicket(id, text),
    onSuccess: () => {
      toast.success("Reply saved!");
      queryClient.invalidateQueries(["supportTickets"]);
      setReplyingTo(null);
      setReplyText("");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send reply"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupportTicket,
    onSuccess: () => {
      toast.success("Message deleted!");
      queryClient.invalidateQueries(["supportTickets"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const handleReplySubmit = (id) => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");
    replyMutation.mutate({ id, text: replyText });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Help & Support</h2>
        <p className="text-gray-500 text-sm">
          Messages from the Contact Us page and in-app Help & Support forms
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <FaEnvelope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No messages found</p>
            <p className="text-xs text-gray-400 mt-1">
              Messages from Contact Us and Help & Support forms will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => {
              const sourceBadge = SOURCE_BADGE[ticket.source] || SOURCE_BADGE.contact_us;
              return (
                <div key={ticket._id} className="p-6 transition-all hover:bg-gray-50/50">
                  <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left: Info */}
                    <div className="flex-1">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Source badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${sourceBadge.className}`}>
                          {sourceBadge.label}
                        </span>
                        {/* Status badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          ticket.status === "open"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {ticket.status}
                        </span>
                        <h4 className="text-base font-bold text-gray-800">{ticket.subject}</h4>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
                        <span>
                          <strong className="text-gray-700">From:</strong>{" "}
                          {ticket.name}{" "}
                          <a href={`mailto:${ticket.email}`} className="text-blue-500 hover:underline">
                            ({ticket.email})
                          </a>
                        </span>
                        <span>
                          <strong className="text-gray-700">Role:</strong>{" "}
                          <span className="capitalize">{ticket.senderRole}</span>
                        </span>
                        <span>
                          <strong className="text-gray-700">Date:</strong>{" "}
                          {new Date(ticket.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Message */}
                      <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-gray-100">
                        {ticket.message}
                      </div>

                      {/* Existing Admin Reply */}
                      {ticket.status === "replied" && ticket.adminReply && (
                        <div className="mt-4 pl-4 border-l-2 border-blue-500">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                            Your Reply
                          </p>
                          <p className="text-sm text-gray-600">{ticket.adminReply}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col items-center lg:items-stretch gap-2 lg:w-40 flex-shrink-0">
                      {ticket.status === "open" && replyingTo !== ticket._id && (
                        <button
                          onClick={() => setReplyingTo(ticket._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-xl transition-colors text-sm"
                        >
                          <FaReply className="w-3.5 h-3.5" /> Reply
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this message permanently?")) {
                            deleteMutation.mutate(ticket._id);
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 font-medium rounded-xl transition-colors text-sm border border-red-100"
                      >
                        <FaTrash className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Inline Reply Form */}
                  {replyingTo === ticket._id && (
                    <div className="mt-5 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <FaReply className="text-blue-500" />
                        Reply to {ticket.name}
                        <span className="text-gray-400 font-normal">— {ticket.email}</span>
                      </h5>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm resize-none mb-3"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmit(ticket._id)}
                          disabled={replyMutation.isLoading}
                          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
                        >
                          {replyMutation.isLoading
                            ? <FaSpinner className="animate-spin w-4 h-4" />
                            : <FaCheckCircle className="w-4 h-4" />
                          }
                          Save Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
