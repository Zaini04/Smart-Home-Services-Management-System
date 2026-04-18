import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaShieldAlt, FaHeart, FaUsers, FaStar, FaHome, FaMapMarkerAlt,
  FaCheckCircle, FaArrowRight,
} from "react-icons/fa";

/* ── Animation helpers ── */
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

/* ── Data ── */
const stats = [
  { value: "10K+", label: "Happy Residents", icon: FaUsers, color: "from-blue-500 to-blue-600" },
  { value: "500+", label: "Verified Providers", icon: FaShieldAlt, color: "from-emerald-500 to-emerald-600" },
  { value: "4.9★", label: "Average Rating", icon: FaStar, color: "from-amber-500 to-orange-500" },
  { value: "Multan", label: "Exclusive Service Area", icon: FaMapMarkerAlt, color: "from-purple-500 to-indigo-600" },
];

const values = [
  {
    icon: FaShieldAlt,
    title: "Trust & Safety",
    desc: "Every service provider undergoes a rigorous background check and skill verification before joining our platform.",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: FaHeart,
    title: "Community First",
    desc: "We are built for Multan. Our mission is to empower local homeowners and hardworking professionals in our city.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
  },
  {
    icon: FaCheckCircle,
    title: "Quality Guaranteed",
    desc: "We stand behind every job. Transparent pricing, verified reviews, and real-time progress tracking.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
  },
  {
    icon: FaUsers,
    title: "Direct Connections",
    desc: "We remove middlemen. Residents and providers connect directly, negotiate freely, and build lasting trust.",
    color: "from-purple-500 to-indigo-600",
    bg: "bg-purple-50",
  },
];

const team = [
  { name: "Muhammad Zaini", role: "Founder & Lead Developer", initial: "MZ", color: "from-blue-500 to-indigo-600" },
  { name: "Team Member", role: "Backend Engineer", initial: "TM", color: "from-emerald-500 to-teal-600" },
  { name: "Team Member", role: "UI/UX Designer", initial: "TM", color: "from-purple-500 to-pink-600" },
];

/* ── Main Component ── */
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-24 lg:py-32">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        {/* Orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
              <FaHome className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium text-white/90">Our Story</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Built for{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Multan's Homes
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto">
              We are a team of passionate developers and dreamers who built a platform to connect Multan homeowners with the best local service providers — removing hassle, adding trust.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission Statement ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-5">
                <FaHeart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Our Mission</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Empowering Every Home in{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Multan
                </span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                HomeFix started with a simple idea: homeowners in Multan deserve a fast, trustworthy, and transparent way to find skilled professionals. No phone tag, no uncertainty — just results.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                We built a platform where residents post their problems, qualified local providers send bids, and both sides communicate directly. Every step is tracked, every payment is transparent, and every review is real.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Get in Touch <FaArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Right — visual card */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
                <FaHome className="w-12 h-12 text-white/30 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Why We Built This</h3>
                <ul className="space-y-4">
                  {[
                    "No reliable platform existed for Multan's service market",
                    "Homeowners wasted hours finding trustworthy workers",
                    "Providers had no digital presence or fair payment system",
                    "We wanted to fix all three problems in one platform",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-blue-100">
                      <FaCheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
              <FaStar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">What We Stand For</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Core{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Values</span>
            </h2>
            <p className="text-gray-600 text-lg">These principles guide every decision we make.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: (i % 4) * 0.12 }}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-500 overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${v.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-12 h-12 ${v.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <v.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
              <FaUsers className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Meet the Team</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The People Behind{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HomeFix
              </span>
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center group"
              >
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  {member.initial}
                </div>
                <p className="font-bold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to experience HomeFix?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of Multan homeowners who have already simplified their home service experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Get Started Free <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
