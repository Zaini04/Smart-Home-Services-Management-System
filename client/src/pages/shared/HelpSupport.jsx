import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaQuestionCircle, FaEnvelope, FaHeadset, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { submitSupportTicket } from "../../api/publicEndPoints";

const faqs = [
  { question: "How does the pricing and inspection work?", answer: "When you book a provider, they will send an estimate. If needed, they will request an inspection fee. Once approved, they inspect and give a final labor cost." },
  { question: "How do I pay?", answer: "After the work is completed, the provider will mark it done. You will then confirm the payment (cash or online) to finalize the job." },
  { question: "Can I cancel a booking?", answer: "Yes. You can cancel before the work starts. However, penalties may apply if the provider was already dispatched." },
  { question: "How is my data protected?", answer: "Your data is secured using standard encryption. Service providers only see your address once you accept their offer." },
];

export default function HelpSupport() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ subject: "", message: "" });
  
  const isResident = user?.role === "resident";

  const mutation = useMutation({
    mutationFn: submitSupportTicket,
    onSuccess: (res) => {
      toast.success(res.data?.message || "Message Sent Successfully!");
      setForm({ subject: "", message: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send message!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to send messages");
      return;
    }
    mutation.mutate({
      name: user.full_name || "Unknown",
      email: user.email,
      subject: form.subject,
      message: form.message,
      source: "help_support",
    });
  };

  return (
    <>
      
      
      <div className={`min-h-screen bg-transparent ${isResident ? "py-10" : "py-4"}`}>
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FaHeadset /> Help & Support
              </h1>
              <p className="text-blue-100 max-w-lg text-sm">
                Need assistance? Check our FAQs below or send a message directly to our admin team.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* FAQs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <FaQuestionCircle className="text-blue-600" /> FAQs
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden transition-all">
                    <button 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left font-medium text-gray-800 text-sm"
                    >
                      {faq.question}
                      {openFaq === idx ? <FaChevronUp className="text-gray-400 flex-shrink-0" /> : <FaChevronDown className="text-gray-400 flex-shrink-0" />}
                    </button>
                    {openFaq === idx && (
                      <div className="p-4 bg-white text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <FaEnvelope className="text-blue-600" /> Contact Support
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Briefly describe your issue" 
                    value={form.subject}
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    rows={4} 
                    required 
                    placeholder="Write your message here..." 
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-all resize-none text-sm" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={mutation.isLoading}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all text-sm disabled:opacity-70"
                >
                  {mutation.isLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      
    </>
  );
}