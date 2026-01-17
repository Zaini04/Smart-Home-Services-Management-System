import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Services from "../components/Services";
import Footer from "../components/Footer";
import { FaArrowUp } from "react-icons/fa";
import HowItWorks from "../components/HowItWorks";

/* ------------------ SCROLL TO TOP BUTTON ------------------ */

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 500);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-50 p-4 rounded-full
        bg-gradient-to-r from-blue-600 to-indigo-600 text-white
        shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
        transition-all duration-300 transform
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}
      `}
    >
      <FaArrowUp className="w-5 h-5" />
    </button>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <section id="features">
          <Features />
        </section>

        {/* Services Section */}
        <section id="services">
          <Services />
        </section>

        {/* How It Works Section */}
        <section id="how">
          <HowItWorks />
        </section>

        {/* Testimonials Section (Optional - can add later) */}
        {/* <section id="testimonials">
          <Testimonials />
        </section> */}
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}