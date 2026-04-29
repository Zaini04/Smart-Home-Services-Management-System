import React from "react";
import { FaTimes } from "react-icons/fa";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${maxWidth} ${className}`}>
        
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
            {onClose && (
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}

        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
};

