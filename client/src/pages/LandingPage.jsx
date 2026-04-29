// pages/LandingPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/shared/Navbar";
import Slider from "../components/shared/Slider";
import Features from "../components/shared/Features";
import Footer from "../components/shared/Footer";
import HowItWorks from "../components/shared/HowItWorks";
import {
  FaArrowUp, FaHeart, FaShieldAlt, FaStar,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight,
  FaCheckCircle, FaUsers, FaPaperPlane, FaTimes, FaSpinner,
} from "react-icons/fa";
import AboutUsSection from "../components/shared/AboutUsSection";
import ContactUsSection from "../components/shared/ContactUsSection";


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

        <AboutUsSection />

        <ContactUsSection />
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}