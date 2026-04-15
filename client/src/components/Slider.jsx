// components/HeroSlider.jsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import s1 from "../assets/images/s1.jpeg";
import s2 from "../assets/images/s2.jpeg";
import s3 from "../assets/images/s3.jpeg";
import s5 from "../assets/images/s5.jpeg";
import s6 from "../assets/images/s6.jpeg";


// Sample data (replace with API call)
const slidesData = [
  {
    id: 1,
    image: s1,
    title: "Professional Plumbing Services",
    subtitle: "Available 24/7",
    description: "From leak detection to complete bathroom installations, our certified plumbers handle every task with precision.",
    ctaText: "Book Now",
    ctaLink: "/services/plumbing",
    accentColor: "blue",
  },
  {
    id: 2,
    image: s2,
    title: "Certified Electrical Experts",
    subtitle: "Safety First",
    description: "Our electricians provide safe wiring, appliance installation, circuit repair, and smart home upgrades.",
    ctaText: "Get Quote",
    ctaLink: "/services/electrical",
    accentColor: "yellow",
  },
  {
    id: 3,
    image: s3,
    title: "Skilled Carpentry & Woodwork",
    subtitle: "Crafted with Care",
    description: "Custom furniture, door repairs, kitchen cabinets, and detailed wood finishing with fine craftsmanship.",
    ctaText: "View Designs",
    ctaLink: "/services/carpentry",
    accentColor: "amber",
  },
  {
    id: 4,
    image:s5,
    title: "Premium Home Painting",
    subtitle: "Transform Your Space",
    description: "Brighten your home with smooth, streak-free painting services with premium colors and finishes.",
    ctaText: "Color Palette",
    ctaLink: "/services/painting",
    accentColor: "purple",
  },
  {
    id: 5,
    image: s6,
    title: "Appliance Maintenance",
    subtitle: "Expert Care",
    description: "AC servicing, fridge repair, oven diagnostics, and home appliance troubleshooting with expert care.",
    ctaText: "Schedule Service",
    ctaLink: "/services/appliance",
    accentColor: "emerald",
  },
];

// Color mapping for Tailwind
const colorClasses = {
  blue: { bg: "bg-blue-600", hover: "hover:bg-blue-700", text: "text-blue-400" },
  yellow: { bg: "bg-yellow-600", hover: "hover:bg-yellow-700", text: "text-yellow-400" },
  amber: { bg: "bg-amber-600", hover: "hover:bg-amber-700", text: "text-amber-400" },
  purple: { bg: "bg-purple-600", hover: "hover:bg-purple-700", text: "text-purple-400" },
  emerald: { bg: "bg-emerald-600", hover: "hover:bg-emerald-700", text: "text-emerald-400" },
};

export default function Slider() {
  const [slides, setSlides] = useState(slidesData);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); 
  const [direction, setDirection] = useState(1);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // Replace with your actual API endpoint
        // const response = await fetch('/api/hero-slides');
        // const data = await response.json();
        // setSlides(data);
      } catch (error) {
        console.error("Error loading slides:", error);
      }
    };
    fetchSlides();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, current]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentSlide = slides[current];
  const colors = colorClasses[currentSlide.accentColor] || colorClasses.blue;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Slides */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-2xl">
                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-sm font-semibold tracking-widest uppercase mb-4 ${colors.text}`}
                >
                  {currentSlide.subtitle}
                </motion.p>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                >
                  {currentSlide.title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed"
                >
                  {currentSlide.description}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <a
                    href={currentSlide.ctaLink}
                    className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white ${colors.bg} ${colors.hover} transition-all hover:shadow-lg hover:shadow-${currentSlide.accentColor}-500/30`}
                  >
                    {currentSlide.ctaText}
                    <ChevronRight className="w-5 h-5" />
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Play/Pause Control */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* Slide Counter */}
      <div className="absolute top-6 left-6 z-20 text-white">
        <span className="text-2xl font-bold">{String(current + 1).padStart(2, "0")}</span>
        <span className="text-white/50 mx-2">/</span>
        <span className="text-lg">{String(slides.length).padStart(2, "0")}</span>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
        <motion.div
          key={current}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className={`h-full ${colors.bg}`}
        />
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? `w-8 ${colors.bg}`
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail Preview */}
      <div className="absolute bottom-8 right-8 z-20 hidden lg:flex gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
              current === index
                ? "border-white scale-105"
                : "border-white/20 opacity-50 hover:opacity-100"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}