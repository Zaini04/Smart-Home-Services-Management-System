import React from "react";
import { FaImage, FaSpinner, FaPlus } from "react-icons/fa";

const SliderForm = ({ 
  onSubmit, 
  title, setTitle, 
  ctaText, setCtaText, 
  ctaLink, setCtaLink, 
  order, setOrder, 
  preview, handleImageChange, 
  loading 
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <FaPlus className="w-4 h-4" />
        </div>
        Add New Slide
      </h3>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Slide Image *</label>
          <div className="relative group border-3 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-all cursor-pointer overflow-hidden aspect-[16/7]">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-inner" />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FaImage className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                </div>
                <span className="text-sm text-gray-500 font-bold">Select high-quality banner</span>
                <p className="text-[10px] text-gray-400 mt-1 uppercase">Recommended: 1920x800px</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Primary Heading *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Modern Living Reimagined"
            className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Button Text</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Button Link</label>
            <input
              type="text"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Display Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          Publish Slide
        </button>
      </form>
    </div>
  );
};

export default SliderForm;
