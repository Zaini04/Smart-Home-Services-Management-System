// components/navbar/LoginPromptModal.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaArrowRight } from "react-icons/fa";

const LoginPromptModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="w-8 h-8 text-blue-600" />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
            Login Required
          </h3>
          <p className="text-gray-500 text-center mb-6">
            Please login or create an account to book a service and access all features.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => { onClose(); navigate("/login"); }}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Login <FaArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onClose(); navigate("/signup"); }}
              className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Create Account
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPromptModal;

