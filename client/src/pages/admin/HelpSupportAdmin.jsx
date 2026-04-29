import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getSupportTickets, replySupportTicket, deleteSupportTicket } from "../../api/adminEndPoints";
import { FaSpinner, FaEnvelope, FaGlobe, FaComments, FaHeadset } from "react-icons/fa";

// Components
import SupportTicketCard from "../../components/admin/support/SupportTicketCard";

const TABS = [
  { key: "all",          label: "Discovery",       icon: FaComments, params: {} },
  { key: "contact_us",   label: "Contact Web",     icon: FaGlobe,    params: { source: "contact_us" } },
  { key: "help_support", label: "App Support",     icon: FaHeadset,  params: { source: "help_support" } },
  { key: "open",         label: "Pending",         icon: null,       params: { status: "open" } },
  { key: "replied",      label: "Resolved",        icon: null,       params: { status: "replied" } },
];

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
      toast.success("Response dispatched successfully!");
      queryClient.invalidateQueries(["supportTickets"]);
      setReplyingTo(null);
      setReplyText("");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to deliver response"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupportTicket,
    onSuccess: () => {
      toast.success("Record cleared from database");
      queryClient.invalidateQueries(["supportTickets"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Operation failed"),
  });

  const handleReplySubmit = (id) => {
    if (!replyText.trim()) return toast.error("Please provide a response body");
    replyMutation.mutate({ id, text: replyText });
  };

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
              <FaHeadset className="text-white w-6 h-6" />
            </div>
            Support Center
          </h1>
          <p className="text-gray-500 font-medium mt-2">Manage customer inquiries and platform feedback.</p>
        </div>
      </div>

      {/* Modern Tab System */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-100 rounded-[2rem] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2.5 px-6 py-3 font-black text-[11px] uppercase tracking-widest transition-all duration-300 rounded-[1.5rem] ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-md scale-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Container */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[600px] relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Retrieving Communications...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-40">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaEnvelope className="text-gray-200 text-4xl" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Inbox Empty</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">
              There are no {activeTab === 'all' ? '' : activeTab} inquiries at the moment. All caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-50">
            {tickets.map((ticket) => (
              <SupportTicketCard 
                key={ticket._id}
                ticket={ticket}
                onReply={handleReplySubmit}
                onDelete={(id) => deleteMutation.mutate(id)}
                isReplying={replyingTo === ticket._id}
                setIsReplying={(val) => setReplyingTo(val ? ticket._id : null)}
                replyText={replyText}
                setReplyText={setReplyText}
                submitting={replyMutation.isPending}
                deleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
