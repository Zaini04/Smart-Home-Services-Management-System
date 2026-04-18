// pages/LandingPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Slider from "../components/Slider";
import Features from "../components/Features";
import Footer from "../components/Footer";
import HowItWorks from "../components/HowItWorks";
import {
  FaArrowUp, FaHeart, FaShieldAlt, FaStar,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight,
  FaCheckCircle, FaUsers, FaPaperPlane, FaTimes, FaSpinner,
} from "react-icons/fa";

/* ── Scroll To Top ── */
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setIsVisible(window.pageYOffset > 500);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-8 right-8 z-50 p-3.5 rounded-full bg-blue-600
        text-white shadow-lg hover:bg-blue-700 transition-all duration-300
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}
    >
      <FaArrowUp className="w-4 h-4" />
    </button>
  );
};

/* ── Inline About Section ── */
const AboutSection = () => (
  <section id="about" className="py-20 bg-white scroll-mt-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-full px-4 py-2 text-sm font-bold mb-4">
          <FaHeart className="w-4 h-4" />
          About Us
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Built for <span className="text-yellow-500">Multan's Homeowners</span>
        </h2>
        <p className="text-gray-600 text-lg">
          HomeFix is Multan's first dedicated home services marketplace.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-600 leading-relaxed mb-5">
            We connect homeowners with trusted, verified local professionals for plumbing, electrical, AC repair, painting, cleaning, and more.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            Our platform makes it easy to post a problem, receive multiple bids, communicate with providers, and get the job done — all in one place, with full transparency on pricing and reviews.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: FaUsers, val: "10,000+", label: "Happy Customers" },
              { icon: FaShieldAlt, val: "500+", label: "Verified Providers" },
              { icon: FaStar, val: "4.9 ★", label: "Average Rating" },
              { icon: FaCheckCircle, val: "98%", label: "Satisfaction Rate" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{s.val}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Read our full story <FaArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Right — values */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          {[
            { title: "Transparency First", desc: "Every bid, every review, every payment is visible to both parties. No surprises." },
            { title: "Local & Trusted", desc: "All providers are from Multan and have passed our verification process." },
            { title: "Fast & Reliable", desc: "Get your first offers within minutes of posting a problem." },
            { title: "Fair for Everyone", desc: "Residents get competitive pricing. Providers get steady work and fair pay." },
          ].map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex gap-4 items-start hover:border-yellow-200 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaCheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{v.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  </section>
);

/* ── Inline Contact Section ── */
const ContactSection = () => {
  const [showForm, setShowForm] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setShowForm(false);
      }, 3000);
    }, 1500);
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
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={sending || sent}
                    className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-auto shadow-md"
                  >
                    {sending ? (
                      <><FaSpinner className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : sent ? (
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

/* ── Main ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <Slider />

        <section id="features" className="scroll-mt-20">
          <Features />
        </section>

        <section id="how" className="scroll-mt-20">
          <HowItWorks />
        </section>

        <AboutSection />

        <ContactSection />
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}