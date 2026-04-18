import React from "react";
import { motion } from "framer-motion";
import {
  FaShieldAlt, FaWallet, FaClock, FaStar,
  FaHeadset, FaMapMarkerAlt, FaCheckCircle,
} from "react-icons/fa";

const features = [
  { icon: FaShieldAlt,    title: "Verified Professionals",  description: "All service providers undergo background checks and skill verification before joining." },
  { icon: FaWallet,       title: "Direct Secure Payments",  description: "Pay providers directly with secure options upon job completion. No hidden fees." },
  { icon: FaClock,        title: "On-Time Service",         description: "Providers respect your time and arrive as scheduled. Real-time job tracking included." },
  { icon: FaStar,         title: "Direct Communication",    description: "Chat directly with local providers, discuss your problem and agree on pricing." },
  { icon: FaHeadset,      title: "24/7 Support",            description: "Our support team is always available to assist you with any query." },
  { icon: FaMapMarkerAlt, title: "Exclusive to Multan",     description: "Dedicated entirely to Multan city — local providers who know the area." },
];

const stats = [
  { value: "10K+",   label: "Happy Customers" },
  { value: "500+",   label: "Verified Providers" },
  { value: "Multan", label: "Exclusive Region" },
  { value: "98%",    label: "Satisfaction Rate" },
];

export default function Features() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 rounded-full px-4 py-2 text-sm font-bold mb-4 border border-yellow-100">
            <FaCheckCircle className="w-4 h-4" />
            Why Choose Us
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Features That Make Us{" "}
            <span className="text-yellow-500">Stand Out</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Built for Multan homeowners who need fast, reliable, and trustworthy home services.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all group"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-yellow-500 transition-colors border border-gray-100 group-hover:border-yellow-400">
                <f.icon className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-gray-900 rounded-3xl p-8 sm:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 shadow-xl relative overflow-hidden"
        >
          {/* Decorative blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-yellow-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center relative z-10"
            >
              <p className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tight">{s.value}</p>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}