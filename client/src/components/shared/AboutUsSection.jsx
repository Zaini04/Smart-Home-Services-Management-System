import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHeart, FaUsers, FaShieldAlt, FaStar, FaCheckCircle, FaArrowRight,
} from "react-icons/fa";

const AboutUsSection = () => (
  <section id="about" className="py-20 bg-white scroll-mt-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-full px-4 py-2 text-sm font-bold mb-4">
          <FaHeart className="w-4 h-4" />
          About Us
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Built for <span className="text-yellow-500">Multan's Homeowners</span>
        </h2>
        <p className="text-gray-600 text-lg">
          HomeFix is Multan's first dedicated home services marketplace.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-600 leading-relaxed mb-5">
            We connect homeowners with trusted, verified local professionals for plumbing, electrical, AC repair, painting, cleaning, and more.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            Our platform makes it easy to post a problem, receive multiple bids, communicate with providers, and get the job done — all in one place, with full transparency on pricing and reviews.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: FaUsers, val: "10,000+", label: "Happy Customers" },
              { icon: FaShieldAlt, val: "500+", label: "Verified Providers" },
              { icon: FaStar, val: "4.9 ★", label: "Average Rating" },
              { icon: FaCheckCircle, val: "98%", label: "Satisfaction Rate" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{s.val}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-blue-600">Built with ❤️ for our city Multan.</p>
        </motion.div>

        {/* Right — values */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          {[
            { title: "Transparency First", desc: "Every bid, every review, every payment is visible to both parties. No surprises." },
            { title: "Local & Trusted", desc: "All providers are from Multan and have passed our verification process." },
            { title: "Fast & Reliable", desc: "Get your first offers within minutes of posting a problem." },
            { title: "Fair for Everyone", desc: "Residents get competitive pricing. Providers get steady work and fair pay." },
          ].map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex gap-4 items-start hover:border-yellow-200 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaCheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{v.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutUsSection;

