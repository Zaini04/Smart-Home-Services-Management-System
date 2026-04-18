import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane,
  FaCheckCircle, FaSpinner, FaInstagram, FaFacebookF,
  FaWhatsapp, FaHeadset,
} from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { submitSupportTicket } from "../api/publicEndPoints";

/* ── Animation helper ── */
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

/* ── Data ── */
const contactInfo = [
  {
    icon: FaPhone,
    title: "Call Us",
    line1: "+92 300 1234567",
    line2: "Mon–Sat, 9am–8pm",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: FaEnvelope,
    title: "Email",
    line1: "support@homefix.pk",
    line2: "We'll reply within 24hrs",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Office Location",
    line1: "Boson Road, Multan",
    line2: "Punjab, Pakistan",
    color: "from-purple-500 to-indigo-600",
  },
];

const socialLinks = [
  { icon: FaFacebookF, url: "#", color: "hover:bg-blue-600", text: "text-blue-600" },
  { icon: FaInstagram, url: "#", color: "hover:bg-pink-600", text: "text-pink-600" },
  { icon: FaWhatsapp,  url: "#", color: "hover:bg-green-500", text: "text-green-500" },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: submitSupportTicket,
    onSuccess: (res) => {
      setSuccess(true);
      toast.success(res.data?.message || "Message Sent!");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-24 lg:py-32">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
              <FaHeadset className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium text-white/90">We'd love to hear from you</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Get in{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-lg text-blue-100/80 max-w-xl mx-auto">
              Have a question, a suggestion, or need help? Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-20 lg:py-28 relative bg-gray-50 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Quick Info Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-16 lg:mb-24 relative -mt-36 lg:-mt-44 z-10">
            {contactInfo.map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm font-medium text-gray-700">{item.line1}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.line2}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left — Form */}
            <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-5">
                <FaPaperPlane className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Send a Message</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Drop Us a{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Line</span>
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                    <textarea
                      required
                      rows="5"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us in detail what's on your mind..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={mutation.isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {mutation.isLoading ? (
                      <>
                        <FaSpinner className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : success ? (
                      <>
                        <FaCheckCircle className="w-5 h-5" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        Send Message
                        <FaPaperPlane className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Right — Sidebar info */}
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-5 space-y-8">
              
              {/* FAQ Teaser */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Looking for quick answers?</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Before sending a message, you might find what you need in our community FAQ section. We've compiled the most common questions from residents and providers.
                  </p>
                  <a href="#" className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                    Visit FAQ Page <span className="ml-2">→</span>
                  </a>
                </div>
              </div>

              {/* Socials */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Connect with us</h3>
                <p className="text-gray-500 text-sm mb-6">Follow us on social media for updates and tips.</p>
                
                <div className="flex items-center justify-center gap-4">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={social.url}
                      className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 transition-all duration-300 group ${social.color}`}
                    >
                      <social.icon className={`w-5 h-5 group-hover:text-white transition-colors duration-300 ${social.text}`} />
                    </a>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
