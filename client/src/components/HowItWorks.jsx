import React, { useState } from "react";
import {
  FaClipboardList,
  FaUserCheck,
  FaCreditCard,
  FaStar,
  FaArrowRight,
  FaCheckCircle,
  FaPlay,
} from "react-icons/fa";

const steps = [
  {
    icon: FaClipboardList,
    title: "Post Your Request",
    desc: "Describe your problem, upload photos, and select your preferred time slot.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    details: [
      "Choose from 50+ service categories",
      "Add photos for better quotes",
      "Set your preferred date & time",
    ],
  },
  {
    icon: FaUserCheck,
    title: "Get Matched",
    desc: "Receive quotes from verified providers and choose the best fit for you.",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    details: [
      "Compare multiple quotes",
      "View provider ratings & reviews",
      "Check availability instantly",
    ],
  },
  {
    icon: FaCreditCard,
    title: "Confirm & Pay",
    desc: "Approve the final price and pay securely through our platform.",
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    details: [
      "Transparent pricing",
      "Multiple payment options",
      "Secure transactions",
    ],
  },
  {
    icon: FaStar,
    title: "Rate & Review",
    desc: "Share your experience to help others find great service providers.",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    details: [
      "Rate your experience",
      "Leave detailed feedback",
      "Build trusted community",
    ],
  },
];

/* ------------------ STEP CARD COMPONENT ------------------ */

const StepCard = ({ step, index, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`
      relative cursor-pointer transition-all duration-500
      ${isActive ? "scale-105" : "scale-100 opacity-70 hover:opacity-100"}
    `}
  >
    {/* Connection Line */}
    {index < steps.length - 1 && (
      <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200 z-0">
        <div
          className={`h-full bg-gradient-to-r ${step.color} transition-all duration-500`}
          style={{ width: isActive ? "100%" : "0%" }}
        />
      </div>
    )}

    <div
      className={`
        relative z-10 p-6 rounded-2xl transition-all duration-300
        ${isActive 
          ? `bg-gradient-to-br ${step.color} shadow-xl` 
          : `${step.bgColor} hover:shadow-lg`
        }
      `}
    >
      {/* Step Number */}
      <div
        className={`
          absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center
          text-sm font-bold shadow-lg
          ${isActive ? "bg-white text-gray-900" : `bg-gradient-to-br ${step.color} text-white`}
        `}
      >
        {index + 1}
      </div>

      {/* Icon */}
      <div
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center mb-4
          ${isActive ? "bg-white/20" : step.bgColor}
        `}
      >
        <step.icon className={`w-7 h-7 ${isActive ? "text-white" : step.iconColor}`} />
      </div>

      {/* Content */}
      <h3 className={`text-lg font-bold mb-2 ${isActive ? "text-white" : "text-gray-900"}`}>
        {step.title}
      </h3>
      <p className={`text-sm ${isActive ? "text-white/80" : "text-gray-600"}`}>
        {step.desc}
      </p>

      {/* Details (shown when active) */}
      {isActive && (
        <ul className="mt-4 space-y-2">
          {step.details.map((detail, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-white/90">
              <FaCheckCircle className="w-3 h-3 flex-shrink-0" />
              {detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

/* ------------------ MAIN COMPONENT ------------------ */

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Simple Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Get your home services done in four simple steps. Quick, easy, and hassle-free.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 mb-16">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              index={index}
              isActive={activeStep === index}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>

        {/* Progress Dots (Mobile) */}
        <div className="flex justify-center gap-2 lg:hidden mb-12">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-300
                ${activeStep === index 
                  ? "w-8 bg-blue-600" 
                  : "bg-gray-300 hover:bg-gray-400"
                }
              `}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h3>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Join thousands of happy customers who have already experienced the convenience of our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg flex items-center justify-center gap-2">
                Book Your First Service
                <FaArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <FaPlay className="w-4 h-4" />
                Watch Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}