import React from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { submitSupportTicket } from "../api/publicEndPoints";
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaTimes, FaSpinner, FaCheckCircle, FaPaperPlane, FaArrowRight
} from "react-icons/fa";

const ContactUsSection = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", message: "", subject: "Contact from Landing Page" });

  const mutation = useMutation({
    mutationFn: submitSupportTicket,
    onSuccess: (res) => {
      toast.success(res.data?.message || "Message Sent!");
      setForm({ name: "", email: "", message: "", subject: "Contact from Landing Page" });
      setTimeout(() => setShowForm(false), 3000);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send message!");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, source: "contact_us" });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <FaEnvelope className="w-4 h-4" />
            Contact Us
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Have a question? <span className="text-blue-600">Let's talk.</span>
          </h2>
          <p className="text-gray-600">
            Reach out to our support team — we're here to help residents and providers alike.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-6 mb-10">
          {[
            { icon: FaPhone, title: "Phone", line1: "+92 300 1234567", line2: "Mon–Sat, 9am–8pm" },
            { icon: FaEnvelope, title: "Email", line1: "support@homefix.pk", line2: "Reply within 24 hours" },
            { icon: FaMapMarkerAlt, title: "Location", line1: "Multan, Punjab", line2: "Pakistan" },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">{c.title}</p>
              <p className="text-sm text-gray-700 font-medium">{c.line1}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.line2}</p>
            </motion.div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto relative">
          {!showForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Send us a message <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 mt-4 overflow-hidden relative"
            >
              <button 
                onClick={() => setShowForm(false)} 
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Send a quick message</h3>
                <p className="text-gray-500 text-sm mt-1">We'll get back to you to your email as soon as possible.</p>
              </div>

              <form onSubmit={handleSubmit} className="grid sm:grid-cols-5 gap-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                  <textarea 
                    required 
                    rows="5"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm resize-none"
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>
                <div className="sm:col-span-2 flex flex-col justify-between space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Email</label>
                    <input 
                      type="email" 
                      required 
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={mutation.isLoading}
                    className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-auto shadow-md"
                  >
                    {mutation.isLoading ? (
                      <><FaSpinner className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : mutation.isSuccess ? (
                      <><FaCheckCircle className="w-4 h-4" /> Message Sent!</>
                    ) : (
                      <><FaPaperPlane className="w-4 h-4 ml-1" /> Send Message</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;
