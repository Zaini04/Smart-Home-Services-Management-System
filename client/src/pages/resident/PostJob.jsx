import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaCamera, FaMapMarkerAlt, FaPaperPlane, FaSpinner,
  FaCheckCircle, FaTrash, FaList, FaEdit, FaTimesCircle, FaLocationArrow
} from "react-icons/fa";
import { getCategories, createBooking } from "../../api/residentsEndpoints";

// Fix Leaflet's default icon missing issue in React
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
L.Marker.prototype.options.icon = L.icon({
  iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41]
});

// Map Component to handle clicks & drop pins
function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMap();

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      map.flyTo(e.latlng, map.getZoom());

      // Reverse Geocode to get address text (Free API)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      } catch (err) { 
        console.error("Geocoding failed"); 
      }
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Categories from API
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [images, setImages] = useState([]);

  // 🌟 Map State
  const [position, setPosition] = useState(null); // { lat, lng }
  const [showMap, setShowMap] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories. Please refresh.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      setError("Only image files are allowed");
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError("");
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 🌟 Handle GPS Button Click
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return setError("Geolocation is not supported by your browser");
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setShowMap(true);
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.display_name) {
            setAddress(data.display_name);
            setError("");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setGettingLocation(false);
        }
      },
      () => {
        setError("Location permission denied. Click the map manually.");
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!selectedCategory) return setError("Please select a category");
    if (!description.trim()) return setError("Please describe your problem");
    if (!address.trim()) return setError("Please enter your address");
    if (!position) return setError("Please drop a pin on the map so the worker can find you.");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("category", selectedCategory._id);
      formData.append("description", description.trim());
      formData.append("address", address.trim());
      
      // 🌟 Append the exact GPS coordinates to send to backend
      formData.append("lat", position.lat);
      formData.append("lng", position.lng);

      images.forEach((image) => {
        formData.append("images", image);
      });

      await createBooking(formData);
      setSuccess(true);

      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Posted! 🎉</h2>
            <p className="text-gray-600 mb-4">
              Workers will start sending their offers soon. You'll be notified when offers arrive.
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <FaSpinner className="animate-spin" />
              <span>Redirecting to My Bookings...</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <FaPaperPlane className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Post a Job</h1>
            <p className="text-gray-600">Describe your problem and get offers from workers</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 flex items-start gap-3">
              <FaTimesCircle className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaList className="text-blue-600" />
                Select Category
                <span className="text-red-500">*</span>
              </h3>

              {categoriesLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No categories available</p>
                  <button
                    type="button"
                    onClick={fetchCategories}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${selectedCategory?._id === category._id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold mb-2
                        ${selectedCategory?._id === category._id
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                        }
                      `}>
                        {category.name?.charAt(0).toUpperCase()}
                      </div>
                      
                      <p className={`font-medium text-sm ${
                        selectedCategory?._id === category._id
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}>
                        {category.name}
                      </p>

                      {selectedCategory?._id === category._id && (
                        <div className="absolute top-2 right-2">
                          <FaCheckCircle className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Problem Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaEdit className="text-blue-600" />
                Describe Your Problem
                <span className="text-red-500">*</span>
              </h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: My ceiling fan is making noise and not rotating properly. It started happening yesterday..."
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none transition-all text-gray-700 placeholder-gray-400"
              />
              <p className="text-xs text-gray-400 mt-2">
                Be as detailed as possible to get accurate quotes from workers
              </p>
            </div>

            {/* Address with Map (Replaced old textarea with this) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  Your Address
                  <span className="text-red-500">*</span>
                </h3>
                <button 
                  type="button" 
                  onClick={handleGetCurrentLocation} 
                  disabled={gettingLocation} 
                  className="text-sm font-medium text-blue-600 flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                >
                  {gettingLocation ? <FaSpinner className="animate-spin" /> : <FaLocationArrow />}
                  Use Current Location
                </button>
              </div>

              {!showMap ? (
                <div 
                  onClick={() => setShowMap(true)} 
                  className="w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors mb-3"
                >
                  <FaMapMarkerAlt className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="font-medium text-gray-500">Click to open map and drop a pin</span>
                </div>
              ) : (
                <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-gray-200 mb-3 relative z-0">
                  <MapContainer 
                    center={position || [30.3753, 69.3451]} 
                    zoom={position ? 15 : 5} 
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
                  </MapContainer>
                </div>
              )}

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Flat number, Street, Area, City... (Auto-fills when you click map)"
                rows={2}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none resize-none transition-all text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Photos */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCamera className="text-blue-600" />
                Add Photos
                <span className="text-gray-400 font-normal text-sm ml-1">(Optional)</span>
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-xl overflow-hidden group border-2 border-gray-200"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash className="text-white w-5 h-5" />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <FaCamera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Add</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />

              <p className="text-xs text-gray-400 mt-3">
                Upload up to 5 photos of the problem • JPG, PNG supported
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || categoriesLoading}
              className={`
                w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300
                ${loading || categoriesLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                }
              `}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Post Job
                </>
              )}
            </button>
          </form>

          <div className="h-8" />
        </div>
      </div>

      <Footer />
    </>
  );
}