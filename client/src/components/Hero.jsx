import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPlay,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaUsers,
  FaClock,
  FaMapMarkerAlt,
  FaSearch,
} from "react-icons/fa";
import hero from "../assets/images/hero.jpeg";

/* ------------------ STAT CARD COMPONENT ------------------ */

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-blue-100">{label}</p>
    </div>
  </div>
);

/* ------------------ FLOATING CARD COMPONENT ------------------ */

const FloatingCard = ({ children, className, delay = 0 }) => (
  <div
    className={`absolute bg-white rounded-2xl shadow-2xl p-4 animate-float ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

/* ------------------ MAIN HERO COMPONENT ------------------ */

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Lahore");

  const trustedCompanies = [
    "10,000+ Customers",
    "500+ Verified Providers",
    "Operating Exclusively in Multan",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 min-h-[90vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-white/90 font-medium">
                Trusted by 10,000+ homeowners
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-6">
              One Place for All
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Home Services
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-blue-100/80 max-w-xl mx-auto lg:mx-0 mb-8">
              Find verified professionals for any home service. Transparent pricing, 
              secure payments, and satisfaction guaranteed.
            </p>

            {/* No Search Bar since we only post problems. We just show simple text here instead of the search bar block. */}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                to="/signup"
                className="group px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Post a Problem
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FaPlay className="w-3 h-3 text-white ml-0.5" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
              {[
                { icon: FaShieldAlt, text: "Verified Providers" },
                { icon: FaClock, text: "24/7 Support" },
                { icon: FaCheckCircle, text: "Money Back Guarantee" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-blue-100/80">
                  <item.icon className="w-4 h-4 text-green-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative hidden lg:block">
            {/* Main Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-2xl opacity-30" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={hero}
                  alt="Home Services"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>

            {/* Floating Cards */}
            <FloatingCard className="top-10 -left-10 z-20" delay={0}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Service Completed</p>
                  <p className="text-sm text-gray-500">AC Repair - ★★★★★</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="top-1/2 -right-8 z-20" delay={0.5}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                    >
                      {["AK", "SM", "RK"][i - 1]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">500+</p>
                  <p className="text-xs text-gray-500">Active Providers</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="bottom-20 -left-6 z-20" delay={1}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FaStar className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">4.9 Rating</p>
                  <p className="text-sm text-gray-500">10K+ Reviews</p>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: FaUsers, value: "10K+", label: "Happy Customers", color: "bg-blue-500" },
            { icon: FaShieldAlt, value: "500+", label: "Verified Providers", color: "bg-green-500" },
            { icon: FaStar, value: "4.9", label: "Average Rating", color: "bg-yellow-500" },
            { icon: FaClock, value: "24/7", label: "Support Available", color: "bg-purple-500" },
          ].map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 30px) scale(1.05); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-blob {
          animation: blob 10s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}