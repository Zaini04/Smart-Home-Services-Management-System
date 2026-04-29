import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicSlides } from "../../api/publicEndPoints";
import { buildMediaUrl } from "../../utils/url";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import s1 from "../../assets/images/s1.jpeg";
import s2 from "../../assets/images/s2.jpeg";
import s3 from "../../assets/images/s3.jpeg";
import s5 from "../../assets/images/s5.jpeg";
import s6 from "../../assets/images/s6.jpeg";

const slidesData = [
  {
    id: 1,
    image: s1,
    title: "Premium Home Maintenance",
    ctaText: "Book Now",
    ctaLink: "/post-job",
  },
  {
    id: 2,
    image: s2,
    title: "Certified Electricians",
    ctaText: "Get a Quote",
    ctaLink: "/post-job",
  },
  {
    id: 3,
    image: s3,
    title: "Skilled Woodwork",
    ctaText: "View Designs",
    ctaLink: "/post-job",
  },
  {
    id: 4,
    image: s5,
    title: "Professional Painting",
    ctaText: "Choose Colors",
    ctaLink: "/post-job",
  },
  {
    id: 5,
    image: s6,
    title: "Appliance Care",
    ctaText: "Schedule Repair",
    ctaLink: "/post-job",
  },
];

export default function Slider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // === Queries ===
  const { data: serverSlides = [], isLoading } = useQuery({
    queryKey: ["publicSlides"],
    queryFn: async () => {
      const res = await getPublicSlides();
      return res.data?.data || [];
    },
  });

  // Decide which slides to use
  const slidesToUse = serverSlides.length > 0 ? serverSlides : slidesData;

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [current, slidesToUse.length]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slidesToUse.length);
  }, [slidesToUse.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length);
  }, [slidesToUse.length]);

  const goToSlide = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const currentSlide = slidesToUse[current];

  if (isLoading) {
    return <div className="w-full h-[85vh] lg:h-screen bg-gray-900 animate-pulse flex items-center justify-center text-white">Loading Slide...</div>;
  }
  if (!currentSlide) return null;

  const bgImage = serverSlides.length > 0 ? buildMediaUrl(currentSlide.image) : currentSlide.image;

  return (
    <div className="relative w-full h-[85vh] lg:h-screen overflow-hidden bg-gray-900 group">
      {/* Slides */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
            style={{ backgroundImage: `url(${bgImage})` }}
          />

          {/* Elegant Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center pt-20">
            <div className="container mx-auto px-6 lg:px-12">
              <div className="max-w-3xl">
                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight"
                >
                  {currentSlide.title}
                </motion.h1>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <a
                    href={currentSlide.ctaLink}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20 text-lg"
                  >
                    {currentSlide.ctaText}
                    <ArrowRight className="w-5 h-5" />
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
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
        {slidesToUse.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              current === index
                ? "w-12 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                : "w-4 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
