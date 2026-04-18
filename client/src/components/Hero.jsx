import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

/* Images for simple, smooth crossfade slider */
import hero1 from "../assets/images/hero.jpeg";
// Assuming you standard fallback images, if you don't have multiple just use hero1
const images = [hero1];

export default function Hero() {
  return (
    <section className="relative bg-white pt-24 lg:pt-32 pb-20 overflow-hidden">
      
      {/* Subtle background element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-blue-50/50 blur-3xl opacity-60 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[75vh]">
          
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-6 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Multan's Premium Home Services
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Your Home,<br />
              <span className="text-blue-600 relative inline-block mt-2">
                Perfectly Fixed.
                {/* Minimal underline accent */}
                <span className="absolute bottom-1 left-0 w-full h-3 bg-yellow-400/30 -z-10 rounded-sm" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              Post your home problem, get competitive bids from verified local providers, and get the job done right. Experience the modern way to maintain your home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link
                to="/post-job"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
              >
                Book a Service
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/signup"
                className="flex items-center justify-center px-8 py-4 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                Join as Provider
              </Link>
            </div>

            {/* Trusted text */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-center lg:justify-start gap-4">
               <div className="flex -space-x-3">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden z-${40-i*10}`}>
                     <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                   </div>
                 ))}
               </div>
               <div className="text-sm text-gray-500 text-left">
                 <span className="font-bold text-gray-900 block">10,000+</span>
                 Happy homeowners
               </div>
            </div>
          </motion.div>

          {/* Right Image Display — Simple & Sleek */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative lg:ml-auto w-full max-w-lg lg:max-w-xl mx-auto"
          >
            {/* Soft backdrop shadow */}
            <div className="absolute -inset-4 bg-blue-100 rounded-[2.5rem] rotate-3 opacity-50" />
            
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
              <img
                src={hero1}
                alt="Professional service provider at work"
                className="w-full h-[400px] sm:h-[500px] object-cover transition-transform duration-1000 hover:scale-105"
              />
              {/* Sleek overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Minimal floating badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">
                  ⭐⭐⭐⭐⭐
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Top Rated Providers</p>
                  <p className="text-xs text-gray-500">Verified and trusted by locals</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}