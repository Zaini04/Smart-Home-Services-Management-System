import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo (3).png";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaApple,
  FaGooglePlay,
  FaArrowRight,
  FaHeart,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";

/* ------------------ NEWSLETTER COMPONENT ------------------ */

// const Newsletter = () => {
//   const [email, setEmail] = useState("");
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     // Simulate API call
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     setIsSubscribed(true);
//     setIsLoading(false);
//   };

//   return (
//     <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8">
//       {/* {isSubscribed ? (
//         <div className="text-center py-4">
//           <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
//             <FaCheckCircle className="w-8 h-8 text-white" />
//           </div>
//           <h3 className="text-xl font-bold text-white mb-2">You're Subscribed!</h3>
//           <p className="text-blue-100">Thank you for subscribing to our newsletter.</p>
//         </div>
//       ) : ( */}
//         <>
//           <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
//             Subscribe to our Newsletter
//           </h3>
//           <p className="text-blue-100 mb-6">
//             Get the latest updates, offers and helpful tips delivered to your inbox.
//           </p>
//           <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1">
//               <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter your email"
//                 required
//                 className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-6 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
//             >
//               {isLoading ? (
//                 <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
//               ) : (
//                 <>
//                   Subscribe
//                   <FaPaperPlane className="w-4 h-4" />
//                 </>
//               )}
//             </button>
//           </form>
//         </>
//       )}
//     </div>
//   );
// };

/* ------------------ SOCIAL ICON COMPONENT ------------------ */

const SocialIcon = ({ Icon, href, color, hoverColor }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`
      w-10 h-10 rounded-full flex items-center justify-center
      bg-gray-100 text-gray-500 hover:text-white transition-all duration-300
      hover:${hoverColor} hover:scale-110 hover:shadow-lg
    `}
    style={{ "--hover-bg": hoverColor }}
  >
    <Icon className="w-4 h-4" />
  </a>
);

/* ------------------ MAIN FOOTER COMPONENT ------------------ */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Service Providers", path: "/serviceproviders" },
    { label: "How it Works", path: "/#how" },
  ];

  const supportLinks = [
    { label: "Help Center", path: "/help" },
    { label: "FAQs", path: "/faqs" },
    { label: "Contact Us", path: "/contact" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
  ];

  const socialLinks = [
    { Icon: FaFacebookF, href: "#", color: "#1877F2" },
    { Icon: FaTwitter, href: "#", color: "#1DA1F2" },
    { Icon: FaInstagram, href: "#", color: "#E4405F" },
    { Icon: FaLinkedinIn, href: "#", color: "#0A66C2" },
    { Icon: FaYoutube, href: "#", color: "#FF0000" },
  ];

  return (
    <footer className="bg-gray-50 border-t pt-5 border-gray-200">
      
      {/* Newsletter Section */}
      {/* <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-0 relative z-10">
        <div className="transform -translate-y-1/2">
          <Newsletter />
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-gray-600 mb-6 max-w-md">
              Connecting you with verified and trusted service providers in your city. 
              Quality home services at your fingertips, available 24/7.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <FaShieldAlt className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Verified Providers</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <FaCheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Secure Payments</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm text-gray-500 hover:text-white transition-all duration-300 hover:scale-110"
                  style={{ 
                    "--hover-bg": social.color,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = social.color}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                >
                  <social.Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                  >
                    <FaArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Render Section Removed */}

          {/* Contact Info */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 text-lg">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">
                    Multan, Pakistan
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <FaPhone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">+92 300 1234567</p>
                  <p className="text-gray-500 text-sm">Mon-Sat, 9am-6pm</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">support@servicehub.pk</p>
                  <p className="text-gray-500 text-sm">24/7 Support</p>
                </div>
              </li>
            </ul>

            {/* App Download Buttons */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Download Our App</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <FaApple className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">Download on</div>
                    <div className="text-sm font-semibold -mt-0.5">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <FaGooglePlay className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[10px] opacity-80">Get it on</div>
                    <div className="text-sm font-semibold -mt-0.5">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} Smart Home Services. All rights reserved.
            </p>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {supportLinks.slice(2).map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="text-gray-500 hover:text-blue-600 text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with <FaHeart className="w-3 h-3 text-red-500" /> in Pakistan
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}