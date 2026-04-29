import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const QuickActionCard = ({ icon: Icon, title, description, linkTo, color, bgColor }) => (
  <Link
    to={linkTo}
    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group block"
  >
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-gray-500">{description}</p>
    <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium text-sm">
      Go to {title}
      <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

export default QuickActionCard;
