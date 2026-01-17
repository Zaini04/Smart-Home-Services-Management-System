import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
  FaIdCard,
  FaList,
  FaTools,
  FaBriefcase,
  FaDollarSign,
  FaClock,
  FaCamera,
  FaUser,
  FaInfoCircle,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import { completeProfile } from "../../api/serviceProviderEndPoints";

/* ------------------ DATA ------------------ */

const SERVICE_CATEGORIES = [
  { name: "Plumber", icon: "🔧", color: "from-blue-500 to-blue-600" },
  { name: "Electrician", icon: "⚡", color: "from-yellow-500 to-orange-500" },
  { name: "Carpenter", icon: "🪚", color: "from-amber-600 to-amber-700" },
  { name: "AC Technician", icon: "❄️", color: "from-cyan-500 to-cyan-600" },
];

const CATEGORY_SKILLS = {
  Plumber: ["Pipe Installation", "Leak Fixing", "Drain Cleaning", "Bathroom Fittings"],
  Electrician: ["Wiring", "Switch Repair", "Appliance Installation", "Fault Finding"],
  Carpenter: ["Furniture Repair", "Door Installation", "Wood Polishing"],
  "AC Technician": ["AC Installation", "Gas Refilling", "Cooling Issue Fix"],
};

/* ------------------ CUSTOM FILE UPLOAD COMPONENT ------------------ */

const FileUploadCard = ({ label, icon, file, setFile, required = false }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
    }
  };

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 ${
        isDragging ? "scale-105" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
          ${preview 
            ? "border-green-400 bg-green-50" 
            : isDragging 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          }
        `}
      >
        <div className="aspect-[4/3] flex flex-col items-center justify-center p-4">
          {preview ? (
            <>
              <img
                src={preview}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center">
                  <FaCamera className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">Change Image</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <FaTrash className="w-3 h-3" />
              </button>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-green-500 text-white text-xs py-1 px-3 rounded-full inline-flex items-center gap-1">
                  <FaCheckCircle className="w-3 h-3" />
                  Uploaded
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-100"} mb-3 transition-colors`}>
                {icon || <FaCloudUploadAlt className={`w-8 h-8 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
              <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
              {required && (
                <span className="absolute top-2 right-2 text-red-500 text-xs font-medium">Required</span>
              )}
            </>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setFile(e.target.files[0])}
      />
    </div>
  );
};

/* ------------------ CATEGORY CARD COMPONENT ------------------ */

const CategoryCard = ({ category, isSelected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform
        ${isSelected 
          ? `bg-gradient-to-br ${category.color} text-white shadow-lg scale-105` 
          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{category.icon}</span>
        <span className="font-medium">{category.name}</span>
      </div>
      {isSelected && (
        <FaCheckCircle className="absolute top-2 right-2 w-5 h-5 text-white/80" />
      )}
    </button>
  );
};

/* ------------------ SKILL CHIP COMPONENT ------------------ */

const SkillChip = ({ skill, isSelected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform
        ${isSelected 
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow"
        }
      `}
    >
      {isSelected && <FaCheckCircle className="inline-block w-3 h-3 mr-2" />}
      {skill}
    </button>
  );
};

/* ------------------ INPUT COMPONENT ------------------ */

const FormInput = ({ icon: Icon, label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
      </label>
      <div className={`relative transition-all duration-200 ${isFocused ? "transform scale-[1.01]" : ""}`}>
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
            ${error 
              ? "border-red-300 bg-red-50 focus:border-red-500" 
              : isFocused 
                ? "border-blue-500 bg-white shadow-md" 
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }
          `}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <FaTimesCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [cnic, setCnic] = useState("");

  const [serviceCategories, setServiceCategories] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skills, setSkills] = useState([]);

  const [experience, setExperience] = useState("");
  const [visitPrice, setVisitPrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  /* ------------------ SKILL AUTO UPDATE ------------------ */

  useEffect(() => {
    let mergedSkills = [];
    serviceCategories.forEach((cat) => {
      mergedSkills = [...mergedSkills, ...(CATEGORY_SKILLS[cat] || [])];
    });
    const uniqueSkills = [...new Set(mergedSkills)];
    setAvailableSkills(uniqueSkills);
    setSkills((prev) => prev.filter((s) => uniqueSkills.includes(s)));
  }, [serviceCategories]);

  /* ------------------ HANDLERS ------------------ */

  const toggleItem = (item, state, setState) => {
    setState((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("userId", user.user_id || user._id);
      formData.append("age", age);
      formData.append("description", bio);
      formData.append("cnic", cnic);
      formData.append("experience", experience);
      formData.append("visitPrice", visitPrice);
      formData.append("hourlyRate", hourlyRate);
      formData.append("serviceCategories", JSON.stringify(serviceCategories));
      formData.append("skills", JSON.stringify(skills));
      formData.append("cnicFront", cnicFrontImage);
      formData.append("cnicBack", cnicBackImage);
      formData.append("profileImage", profileImage);

      // await axios.post(
      //   "http://localhost:5000/api/serviceProvider/complete-profile",
      //   formData,
      //   { headers: { "Content-Type": "multipart/form-data" } }
      // );
        await completeProfile(formData)


      navigate("/provider-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Profile submission failed");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    let filled = 0;
    const total = 10;
    if (age) filled++;
    if (bio) filled++;
    if (cnic) filled++;
    if (serviceCategories.length > 0) filled++;
    if (skills.length > 0) filled++;
    if (experience) filled++;
    if (visitPrice) filled++;
    if (hourlyRate) filled++;
    if (profileImage) filled++;
    if (cnicFrontImage && cnicBackImage) filled++;
    return Math.round((filled / total) * 100);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Authentication Required</h2>
          <p className="text-gray-500 mb-4">Please login to complete your profile</p>
          <button 
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  /* ------------------ UI ------------------ */

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <FaUser className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Provider Profile</h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Fill in your details to start receiving service requests from customers in your area
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className={`text-sm font-bold ${progress === 100 ? "text-green-600" : "text-blue-600"}`}>
                {progress}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress === 100 
                    ? "bg-gradient-to-r from-green-400 to-green-600" 
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                <FaCheckCircle /> All fields completed! You're ready to submit.
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
              <FaTimesCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Submission Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">

          {/* Profile Image Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCamera className="text-blue-600" />
              Profile Photo
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-40">
                <FileUploadCard
                  label="Your Photo"
                  icon={<FaUser className="w-8 h-8 text-gray-400" />}
                  file={profileImage}
                  setFile={setProfileImage}
                  required
                />
              </div>
              <div className="text-center md:text-left">
                <h4 className="font-medium text-gray-700">Upload a professional photo</h4>
                <p className="text-gray-500 text-sm mt-1">
                  A clear, professional photo helps build trust with customers.
                  Make sure your face is clearly visible.
                </p>
                <ul className="text-xs text-gray-400 mt-3 space-y-1">
                  <li>✓ High quality image (min 400x400px)</li>
                  <li>✓ Professional appearance</li>
                  <li>✓ Good lighting</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <FormInput
                icon={FaCalendarAlt}
                label="Age"
                type="number"
                required
                min="18"
                max="70"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />

              <FormInput
                icon={FaIdCard}
                label="CNIC Number"
                type="text"
                required
                placeholder="XXXXX-XXXXXXX-X"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaInfoCircle className="w-4 h-4 text-gray-500" />
                About You
              </label>
              <textarea
                rows="4"
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell customers about yourself, your experience, specialties, and what makes your service stand out..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 
                         hover:border-gray-300 focus:border-blue-500 focus:bg-white 
                         focus:shadow-md transition-all duration-200 outline-none resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                Minimum 50 characters recommended for better profile visibility
              </p>
            </div>
          </div>

          {/* Service Categories */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaList className="text-blue-600" />
              Service Categories
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Select all the categories you can provide services in
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SERVICE_CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.name}
                  category={cat}
                  isSelected={serviceCategories.includes(cat.name)}
                  onToggle={() => toggleItem(cat.name, serviceCategories, setServiceCategories)}
                />
              ))}
            </div>
          </div>

          {/* Skills Section */}
          {availableSkills.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FaTools className="text-blue-600" />
                Your Skills
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Select the specific skills you're proficient in
              </p>

              <div className="flex flex-wrap gap-3">
                {availableSkills.map((skill) => (
                  <SkillChip
                    key={skill}
                    skill={skill}
                    isSelected={skills.includes(skill)}
                    onToggle={() => toggleItem(skill, skills, setSkills)}
                  />
                ))}
              </div>

              {skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">{skills.length}</span> skills selected
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Experience & Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaBriefcase className="text-blue-600" />
              Experience & Pricing
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative">
                <FormInput
                  icon={FaClock}
                  label="Years of Experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g., 5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
                <span className="absolute right-4 top-[42px] text-gray-400 text-sm">years</span>
              </div>

              <div className="relative">
                <FormInput
                  icon={FaDollarSign}
                  label="Visit Charge"
                  type="number"
                  min="0"
                  placeholder="e.g., 500"
                  value={visitPrice}
                  onChange={(e) => setVisitPrice(e.target.value)}
                />
                <span className="absolute right-4 top-[42px] text-gray-400 text-sm">PKR</span>
              </div>

              <div className="relative">
                <FormInput
                  icon={FaClock}
                  label="Hourly Rate"
                  type="number"
                  min="0"
                  placeholder="e.g., 1000"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
                <span className="absolute right-4 top-[42px] text-gray-400 text-sm">PKR/hr</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                💡 <span className="font-medium">Tip:</span> Competitive pricing attracts more customers. 
                Research local rates to stay competitive.
              </p>
            </div>
          </div>

          {/* CNIC Documents */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaIdCard className="text-blue-600" />
              Identity Verification
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Upload clear photos of your CNIC (front and back) for verification
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <FileUploadCard
                label="CNIC Front Side"
                icon={<FaIdCard className="w-8 h-8 text-gray-400" />}
                file={cnicFrontImage}
                setFile={setCnicFrontImage}
                required
              />
              <FileUploadCard
                label="CNIC Back Side"
                icon={<FaIdCard className="w-8 h-8 text-gray-400" />}
                file={cnicBackImage}
                setFile={setCnicBackImage}
                required
              />
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl flex gap-3">
              <FaInfoCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Privacy Notice</p>
                <p className="mt-1">
                  Your CNIC images are encrypted and stored securely. They are only used for 
                  identity verification and are never shared with customers.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300
                flex items-center justify-center gap-3
                ${loading 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5"
                }
              `}
            >
              {loading ? (
                <>
                  <FaSpinner className="w-5 h-5 animate-spin" />
                  Submitting Your Profile...
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-5 h-5" />
                  Submit Profile for Review
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              By submitting, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </form>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>

      <Footer />
    </>
  );
}