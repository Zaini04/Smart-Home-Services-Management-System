import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaClipboardList, FaUsers, FaCheckCircle, 
  FaTools, FaCreditCard, FaStar,
  FaChevronLeft, FaChevronRight, FaArrowRight, FaHome
} from "react-icons/fa";

/* ── Steps data ── */
const steps = [
  {
    number: "01",
    icon: FaClipboardList,
    title: "Post Your Problem",
    description: "Describe what needs fixing with photos and location. Takes less than a minute.",
  },
  {
    number: "02",
    icon: FaUsers,
    title: "Get Offers",
    description: "Verified local providers review your request and send competitive bids quickly.",
  },
  {
    number: "03",
    icon: FaCheckCircle,
    title: "Choose Provider",
    description: "Compare prices, ratings, and experience to pick the best provider for the job.",
  },
  {
    number: "04",
    icon: FaTools,
    title: "Service Delivery",
    description: "Your chosen professional arrives on time and fixes your home issue properly.",
  },
  {
    number: "05",
    icon: FaCreditCard,
    title: "Secure Payment",
    description: "Pay securely only after you are fully satisfied with the completed work.",
  },
  {
    number: "06",
    icon: FaStar,
    title: "Leave a Review",
    description: "Rate your experience to help other homeowners in Multan make informed choices.",
  },
];

export default function HowItWorks() {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <FaHome className="w-4 h-4 text-gray-500" />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How <span className="text-blue-600">HomeFix</span> Works
          </h2>
          <p className="text-gray-600">
            From posting a problem to getting it fixed. A seamless and reliable process in exactly 6 steps.
          </p>
        </motion.div>

        {/* ── Carousel Container ── */}
        <div className="relative max-w-6xl mx-auto">
          {/* Scroll Buttons */}
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-200 shadow-md rounded-full items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all font-bold"
            aria-label="Scroll left"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={scrollRight}
            className="hidden md:flex absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-200 shadow-md rounded-full items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-all font-bold"
            aria-label="Scroll right"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>

          {/* Cards Track */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4 px-4 -mx-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="snap-start flex-none w-[280px] sm:w-[320px] bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative group"
              >
                {/* Step Number Background */}
                <div className="absolute top-6 right-6 text-6xl font-black text-gray-50/80 group-hover:text-blue-50/80 transition-colors pointer-events-none select-none">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed relative z-10">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA: Are you ready to book a service? ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mt-20 max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="grid lg:grid-cols-2">
            {/* Left Box (Dark gray instead of light blue) */}
            <div className="bg-gray-900 p-10 sm:p-14 flex flex-col justify-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Are you ready to book a service?
              </h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Join thousands of homeowners in Multan who get their home problems solved quickly and affordably through HomeFix.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/post-job"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
                >
                  Book a Service
                  <FaArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-700 text-gray-300 font-bold rounded-xl hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Join as Provider
                </Link>
              </div>
            </div>

            {/* Right Side visual (Slightly lighter dark/accent) */}
            <div className="hidden lg:flex items-center justify-center bg-gray-800 p-14 relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gray-700 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-900 rounded-full blur-3xl opacity-50 -ml-20 -mb-20 pointer-events-none" />
              
              <div className="text-center relative z-10">
                <div className="text-8xl mb-6 transform -rotate-6">🏠</div>
                <p className="text-white font-bold text-2xl tracking-wide mb-1">HomeFix</p>
                <p className="text-gray-400 text-sm mb-8">Multan's Premium Service Network</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["Plumbing", "Electrical", "Carpentry", "Cleaning", "Repair"].map((s) => (
                    <span key={s} className="px-4 py-1.5 bg-gray-700/50 text-gray-300 text-xs font-semibold rounded-full border border-gray-600 backdrop-blur-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}