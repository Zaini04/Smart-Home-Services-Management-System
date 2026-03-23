import React from "react";
import {
  FaShieldAlt,
  FaWallet,
  FaClock,
  FaStar,
  FaHeadset,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

const features = [
  {
    icon: FaShieldAlt,
    title: "Verified Professionals",
    description: "All service providers undergo thorough background checks and skill verification.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: FaWallet,
    title: "Direct Secure Payments",
    description: "Pay providers directly with secure cash or local transfer options upon completion.",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
  },
  {
    icon: FaClock,
    title: "On-Time Service",
    description: "Our providers respect your time and arrive punctually as scheduled.",
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: FaStar,
    title: "Direct Communication",
    description: "Chat directly with local providers to discuss your problem and negotiate pricing before commitment.",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: FaHeadset,
    title: "24/7 Support",
    description: "Our customer support team is available round the clock to assist you.",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Exclusive to Multan",
    description: "Dedicated entirely to serving the residents and providers of Multan city.",
    color: "from-cyan-500 to-teal-600",
    bgColor: "bg-cyan-50",
  },
];

/* ------------------ FEATURE CARD COMPONENT ------------------ */

const FeatureCard = ({ feature, index }) => (
  <div
    className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Background Gradient on Hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

    {/* Icon */}
    <div className={`relative w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
      <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} 
        style={{ 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
        }}
      />
      <feature.icon className={`w-7 h-7 absolute bg-gradient-to-br ${feature.color}`} 
        style={{ 
          background: `linear-gradient(135deg, ${feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('green') ? '#22c55e' : feature.color.includes('purple') ? '#a855f7' : feature.color.includes('amber') ? '#f59e0b' : feature.color.includes('pink') ? '#ec4899' : '#06b6d4'}, ${feature.color.includes('blue') ? '#2563eb' : feature.color.includes('green') ? '#059669' : feature.color.includes('purple') ? '#4f46e5' : feature.color.includes('amber') ? '#ea580c' : feature.color.includes('pink') ? '#e11d48' : '#0d9488'})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      />
    </div>

    {/* Content */}
    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
      {feature.title}
    </h3>
    <p className="text-gray-600 leading-relaxed">
      {feature.description}
    </p>

    {/* Learn More Link */}
    <div className="mt-5 flex items-center gap-2 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
      <span>Learn more</span>
      <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

/* ------------------ MAIN COMPONENT ------------------ */

export default function Features() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
            <FaCheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Why Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Features That Make Us{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Stand Out
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            We're committed to providing the best service experience with features 
            designed to give you peace of mind.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "500+", label: "Verified Providers" },
              { value: "Multan", label: "Exclusive Region" },
              { value: "98%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}