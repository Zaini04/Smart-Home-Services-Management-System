import React from "react";
import { FaReply, FaTrash, FaCheckCircle, FaSpinner, FaUserAlt, FaEnvelopeOpenText } from "react-icons/fa";

const SOURCE_BADGE = {
  contact_us:   { label: "Contact Us",    className: "bg-purple-100 text-purple-700" },
  help_support: { label: "Help & Support", className: "bg-blue-100 text-blue-700" },
};

const SupportTicketCard = ({ 
  ticket, 
  onReply, 
  onDelete, 
  isReplying, 
  setIsReplying, 
  replyText, 
  setReplyText, 
  submitting,
  deleting
}) => {
  const sourceBadge = SOURCE_BADGE[ticket.source] || SOURCE_BADGE.contact_us;

  return (
    <div className="p-8 hover:bg-gray-50/80 transition-all group animate-fadeIn">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Section: Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sourceBadge.className} border border-current opacity-70`}>
              {sourceBadge.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              ticket.status === "open"
                ? "bg-amber-50 text-amber-600 border-amber-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
              {ticket.status}
            </span>
            <div className="h-4 w-px bg-gray-200 mx-1"></div>
            <h4 className="text-xl font-black text-gray-900 tracking-tight">{ticket.subject}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <FaUserAlt className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sender</p>
                <p className="text-sm font-bold text-gray-700 truncate">{ticket.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <FaEnvelopeOpenText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-blue-600 truncate">{ticket.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <FaEnvelopeOpenText className="w-4 h-4 rotate-12" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Received</p>
                <p className="text-sm font-bold text-gray-700">
                  {new Date(ticket.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-100 text-gray-700 text-base leading-relaxed italic relative">
            <span className="absolute -top-3 left-6 px-3 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</span>
            "{ticket.message}"
          </div>

          {ticket.status === "replied" && ticket.adminReply && (
            <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-blue-100/50 relative">
              <span className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Official Response</span>
              <p className="text-sm font-bold text-blue-900/80 leading-relaxed">
                {ticket.adminReply}
              </p>
            </div>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex lg:flex-col gap-3 lg:w-48 flex-shrink-0">
          {ticket.status === "open" && !isReplying && (
            <button
              onClick={() => setIsReplying(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 text-xs uppercase tracking-widest"
            >
              <FaReply /> Reply
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm("Permanently remove this support record?")) {
                onDelete(ticket._id);
              }
            }}
            disabled={deleting}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-red-50 text-red-500 font-black rounded-2xl hover:bg-red-50 transition-all text-xs uppercase tracking-widest hover:border-red-100"
          >
            {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />} Delete
          </button>
        </div>
      </div>

      {/* Reply UI */}
      {isReplying && (
        <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] border-2 border-blue-100 shadow-inner animate-scaleIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <FaReply className="text-white" />
            </div>
            <div>
              <h5 className="text-lg font-black text-gray-900 tracking-tight">Drafting Response</h5>
              <p className="text-xs font-bold text-gray-400">Replying to {ticket.email}</p>
            </div>
          </div>
          
          <textarea
            rows={5}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a helpful and professional response..."
            className="w-full px-6 py-5 bg-white rounded-2xl border-2 border-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-800 shadow-sm"
          />
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => { setIsReplying(false); setReplyText(""); }}
              className="px-8 py-3 bg-white text-gray-500 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-200"
            >
              Discard
            </button>
            <button
              onClick={() => onReply(ticket._id)}
              disabled={submitting || !replyText.trim()}
              className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
              Send Reply
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default SupportTicketCard;
