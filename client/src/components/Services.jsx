import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaClock,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
  FaFire,
  FaBolt,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import fan from "../assets/images/fan.jpeg";
import wiring from "../assets/images/wiring.jpeg";
import pipe from "../assets/images/pipe.jpeg";
import ac from "../assets/images/ac.jpeg";

const sampleServices = [
  {
    id: 1,
    image: fan,
    title: "Switch / Fan Repair",
    category: "Electrical",
    price: 300,
    originalPrice: 500,
    rating: 4.8,
    reviews: 234,
    duration: "30-45 min",
    isPopular: true,
    discount: 40,
  },
  {
    id: 2,
    image: wiring,
    title: "Wiring & Rewiring",
    category: "Electrical",
    price: 1200,
    originalPrice: 1500,
    rating: 4.9,
    reviews: 189,
    duration: "2-3 hours",
    isPopular: false,
    discount: 20,
  },
  {
    id: 3,
    image: pipe,
    title: "Tap & Pipe Fix",
    category: "Plumbing",
    price: 500,
    originalPrice: 700,
    rating: 4.7,
    reviews: 312,
    duration: "45-60 min",
    isPopular: true,
    discount: 30,
  },
  {
    id: 4,
    image: ac,
    title: "AC Gas Refill",
    category: "AC Services",
    price: 3500,
    originalPrice: 4500,
    rating: 4.9,
    reviews: 456,
    duration: "1-2 hours",
    isPopular: true,
    discount: 22,
  },
];

const categories = [
  { name: "All", count: 45 },
  { name: "Electrical", count: 12 },
  { name: "Plumbing", count: 8 },
  { name: "AC Services", count: 10 },
  { name: "Carpentry", count: 7 },
  { name: "Cleaning", count: 8 },
];

/* ------------------ SERVICE CARD COMPONENT ------------------ */

const ServiceCard = ({ service }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {service.isPopular && (
            <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
              <FaFire className="w-3 h-3" /> Popular
            </span>
          )}
          {service.discount > 0 && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
              {service.discount}% OFF
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isFavorite 
              ? "bg-red-500 text-white" 
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
          } shadow-lg`}
        >
          {isFavorite ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
        </button>

        {/* Quick Book Button (appears on hover) */}
        <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button className="w-full py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
            <FaBolt className="w-4 h-4 text-yellow-500" />
            Quick Book
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            {service.category}
          </span>
          <div className="flex items-center gap-1 text-sm">
            <FaClock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-500">{service.duration}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
          {service.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 text-yellow-500">
            <FaStar className="w-4 h-4 fill-current" />
            <span className="font-semibold text-gray-900">{service.rating}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-500">{service.reviews} reviews</span>
        </div>

        {/* Price & Book Button */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                PKR {service.price.toLocaleString()}
              </span>
              {service.originalPrice > service.price && (
                <span className="text-sm text-gray-400 line-through">
                  PKR {service.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">Starting price</span>
          </div>
          <Link
            to={`/service/${service.id}`}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            Book
            <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function Services() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 mb-4">
              <FaShieldAlt className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Verified Services</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Popular{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-xl">
              Explore our most booked services with guaranteed satisfaction and transparent pricing.
            </p>
          </div>

          <Link
            to="/allservices"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            View All Services
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`
                flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300
                ${activeCategory === category.name
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {category.name}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeCategory === category.name ? "bg-white/20" : "bg-gray-200"
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
            <p className="text-gray-700">
              <span className="font-semibold">Can't find what you need?</span>
              {" "}We have 50+ more services available.
            </p>
            <Link
              to="/allservices"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
            >
              Explore All
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}