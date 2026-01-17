import { useState, useEffect } from "react";

import plumber from "../assets/images/s1.jpeg";
import electrician from "../assets/images/s2.jpeg";
import carpenter from "../assets/images/s3.jpeg";
import painter from "../assets/images/s5.jpeg";
import technician from "../assets/images/s6.jpeg";

export default function Slider() {
  const slides = [
    {
      image: plumber,
      title: "Professional Plumbing Services",
      description:
        "From leak detection to complete bathroom installations, our certified plumbers handle every task with precision. We ensure quick repairs, long-lasting solutions, and reliable emergency support for your home.",
    },
    {
      image: electrician,
      title: "Certified Electrical Experts",
      description:
        "Our electricians provide safe wiring, appliance installation, circuit repair, and smart home electrical upgrades. We focus on safety, efficiency, and high-quality craftsmanship for every home.",
    },
    {
      image: carpenter,
      title: "Skilled Carpentry and Woodwork",
      description:
        "Whether it's custom furniture, door repairs, kitchen cabinets, or detailed wood finishing, our carpenters deliver fine craftsmanship built to last. Quality materials and sharp detailing guaranteed.",
    },
    {
      image: painter,
      title: "Premium Home & Wall Painting",
      description:
        "Brighten your home with smooth, streak-free painting services. Choose from a range of premium colors and finishes handled by expert painters trained for clean, professional results.",
    },
    {
      image: technician,
      title: "Home Appliance Maintenance",
      description:
        "AC servicing, fridge repair, oven diagnostics, and home appliance troubleshooting — our technicians ensure everything runs smoothly with timely fixes and expert-level care.",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const reset = setTimeout(() => setAnimate(false), 900);
    return () => clearTimeout(reset);
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => setCurrent(index);

  return (
    <div className="w-full h-[90vh] relative overflow-hidden">

      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="w-full h-full flex-shrink-0 relative"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            
            }}
          >

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center px-10">
              
              {/* Text area (left side) */}
              <div className="max-w-xl text-left">
                
                {/* Title */}
                <h1
                  className={`text-text text-4xl font-bold drop-shadow-lg mb-4 ${
                    animate ? "animate-title" : ""
                  }`}
                >
                  {slide.title}
                </h1>

                {/* Description */}
                <p
                  className={`text-text text-lg leading-relaxed drop-shadow ${
                    animate ? "animate-description" : ""
                  }`}
                >
                  {slide.description}
                </p>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-[10px] h-[10px] rounded-full transition-all ${
              current === index
                ? "bg-white scale-110"
                : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
