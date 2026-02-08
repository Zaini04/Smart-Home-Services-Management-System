import React, { useEffect, useState, useRef } from "react";
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
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import {
  getCategoriesWithSkills,
  getProviderProfile,
  updateProviderProfile,
} from "../../api/serviceProviderEndPoints";

/* ------------------ REUSE COMPONENTS FROM CompleteProfile.jsx ------------------ */
// Copy FileUploadCard, CategoryCard, SkillChip, FormInput components here
// Or create a shared components folder

const FileUploadCard = ({ label, icon, file, setFile, currentImage, required = false }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (currentImage) {
      setPreview(`http://localhost:5000/${currentImage}`);
    } else {
      setPreview(null);
    }
  }, [file, currentImage]);

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
            </>
          ) : (
            <>
              <div className={`p-4 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-100"} mb-3`}>
                {icon || <FaCloudUploadAlt className={`w-8 h-8 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
              <p className="text-xs text-gray-500">Drag & drop or click</p>
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

const CategoryCard = ({ category, isSelected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`
      relative overflow-hidden rounded-xl p-4 transition-all duration-300 w-full text-left flex items-center gap-3
      ${isSelected 
        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md border-2" 
        : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
      }
    `}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold
         ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
         {category.name.charAt(0).toUpperCase()}
    </div>
    <span className="font-medium">{category.name}</span>
    {isSelected && <FaCheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-500" />}
  </button>
);

const SkillChip = ({ skill, isSelected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`
      px-4 py-2 rounded-full text-sm font-medium transition-all border
      ${isSelected 
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md" 
        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
      }
    `}
  >
    {isSelected && <FaCheckCircle className="inline-block w-3 h-3 mr-2" />}
    {skill.name}
  </button>
);

const FormInput = ({ icon: Icon, label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        {label}
      </label>
      <input
        {...props}
        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all outline-none
          ${error 
            ? "border-red-300 bg-red-50" 
            : isFocused 
              ? "border-blue-500 bg-white shadow-md" 
              : "border-gray-200 bg-gray-50 hover:border-gray-300"
          }
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <FaTimesCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};

const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

/* ------------------ MAIN COMPONENT ------------------ */

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [cnic, setCnic] = useState("");
  const [experience, setExperience] = useState("");
  const [visitPrice, setVisitPrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  // Current Images (from DB)
  const [currentProfileImage, setCurrentProfileImage] = useState("");
  const [currentCnicFront, setCurrentCnicFront] = useState("");
  const [currentCnicBack, setCurrentCnicBack] = useState("");

  // New Files (if user uploads new ones)
  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Categories & Skills
  const [allData, setAllData] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Admin Rejection Message
  const [rejectionMessage, setRejectionMessage] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------------ FETCH DATA ON MOUNT ------------------ */
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        setPageLoading(true);
        const userId = user.user_id || user._id;

        // Fetch categories
        const catRes = await getCategoriesWithSkills();
        const categories = catRes.data?.data || [];
        setAllData(categories);

        // Fetch existing profile
        const profileRes = await getProviderProfile(userId);
        const profile = profileRes.data?.data;

        if (!profile) {
          navigate("/complete-profile");
          return;
        }

        // Check if profile is rejected
        if (profile.kycStatus !== "rejected") {
          navigate("/kyc-status");
          return;
        }

        // Populate form with existing data
        setAge(profile.age || "");
        setBio(profile.description || "");
        setCnic(profile.cnic || "");
        setExperience(profile.experience || "");
        setVisitPrice(profile.visitPrice || "");
        setHourlyRate(profile.hourlyRate || "");
        setRejectionMessage(profile.kycMessage || "");

        // Set current images
        setCurrentProfileImage(profile.profileImage || "");
        setCurrentCnicFront(profile.cnicFrontImage || "");
        setCurrentCnicBack(profile.cnicBackImage || "");

        // Set categories (extract IDs)
        const catIds = profile.serviceCategories?.map(c => c._id || c) || [];
        setSelectedCategories(catIds);

        // Set skills (extract IDs)
        const skillIds = profile.skills?.map(s => s._id || s) || [];
        setSelectedSkills(skillIds);

        // Update available skills based on selected categories
        const relevantCats = categories.filter(cat => catIds.includes(cat._id));
        let skills = [];
        relevantCats.forEach(cat => {
          if (cat.subCategories) skills = [...skills, ...cat.subCategories];
        });
        setAvailableSkills(skills);

      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  /* ------------------ HANDLE CATEGORY SELECTION ------------------ */
  const toggleCategory = (categoryId) => {
    if (!isValidObjectId(categoryId)) return;

    let newCategories;
    if (selectedCategories.includes(categoryId)) {
      newCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      newCategories = [...selectedCategories, categoryId];
    }
    setSelectedCategories(newCategories);

    // Update available skills
    const relevantCats = allData.filter(cat => newCategories.includes(cat._id));
    let newSkills = [];
    relevantCats.forEach(cat => {
      if (cat.subCategories) newSkills = [...newSkills, ...cat.subCategories];
    });
    setAvailableSkills(newSkills);

    // Clean up selected skills
    const validSkillIds = newSkills.map(s => s._id);
    setSelectedSkills(prev => prev.filter(id => validSkillIds.includes(id)));
  };

  /* ------------------ HANDLE SKILL SELECTION ------------------ */
  const toggleSkill = (skillId) => {
    if (!isValidObjectId(skillId)) return;
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  /* ------------------ SUBMIT HANDLER ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (selectedCategories.length === 0) {
      setError("Please select at least one category.");
      setLoading(false);
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Please select at least one skill.");
      setLoading(false);
      return;
    }

    try {
      const userId = user.user_id || user._id;
      const formData = new FormData();

      formData.append("age", age);
      formData.append("description", bio);
      formData.append("cnic", cnic);
      formData.append("experience", experience);
      formData.append("visitPrice", visitPrice);
      formData.append("hourlyRate", hourlyRate);
      formData.append("serviceCategories", JSON.stringify(selectedCategories));
      formData.append("skills", JSON.stringify(selectedSkills));

      // Only append new images if uploaded
      if (profileImage) formData.append("profileImage", profileImage);
      if (cnicFrontImage) formData.append("cnicFront", cnicFrontImage);
      if (cnicBackImage) formData.append("cnicBack", cnicBackImage);

      await updateProviderProfile(userId, formData);
      navigate("/kyc-status");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => navigate("/kyc-status")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Status
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Your Profile</h1>
            <p className="text-gray-600">Update the required information and resubmit for review</p>
          </div>

          {/* Rejection Message */}
          {rejectionMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 flex items-start gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Admin Feedback:</h3>
                <p className="text-red-700">{rejectionMessage}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Profile Image */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCamera className="text-blue-600" />
                Profile Photo
              </h3>
              <div className="flex items-center gap-6">
                <div className="w-40">
                  <FileUploadCard
                    label="Your Photo"
                    icon={<FaUser className="w-8 h-8 text-gray-400" />}
                    file={profileImage}
                    setFile={setProfileImage}
                    currentImage={currentProfileImage}
                  />
                </div>
                <p className="text-gray-500 text-sm">Upload a new photo or keep the existing one</p>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  icon={FaCalendarAlt}
                  label="Age"
                  type="number"
                  min="18"
                  max="70"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                <FormInput
                  icon={FaIdCard}
                  label="CNIC Number"
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                />
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">About You</label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaList className="text-blue-600" />
                Service Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allData.map((cat) => (
                  <CategoryCard
                    key={cat._id}
                    category={cat}
                    isSelected={selectedCategories.includes(cat._id)}
                    onToggle={() => toggleCategory(cat._id)}
                  />
                ))}
              </div>
            </div>

            {/* Skills */}
            {availableSkills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaTools className="text-blue-600" />
                  Your Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {availableSkills.map((skill) => (
                    <SkillChip
                      key={skill._id}
                      skill={skill}
                      isSelected={selectedSkills.includes(skill._id)}
                      onToggle={() => toggleSkill(skill._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Experience & Pricing */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FaBriefcase className="text-blue-600" />
                Experience & Pricing
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <FormInput
                  icon={FaClock}
                  label="Years of Experience"
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
                <FormInput
                  icon={FaDollarSign}
                  label="Visit Charge (PKR)"
                  type="number"
                  value={visitPrice}
                  onChange={(e) => setVisitPrice(e.target.value)}
                />
                <FormInput
                  icon={FaClock}
                  label="Hourly Rate (PKR)"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
            </div>

            {/* CNIC Documents */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaIdCard className="text-blue-600" />
                Identity Documents
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FileUploadCard
                  label="CNIC Front"
                  icon={<FaIdCard className="w-8 h-8 text-gray-400" />}
                  file={cnicFrontImage}
                  setFile={setCnicFrontImage}
                  currentImage={currentCnicFront}
                />
                <FileUploadCard
                  label="CNIC Back"
                  icon={<FaIdCard className="w-8 h-8 text-gray-400" />}
                  file={cnicBackImage}
                  setFile={setCnicBackImage}
                  currentImage={currentCnicBack}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3
                  ${loading 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  }
                `}
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5" />
                    Resubmit Profile for Review
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="h-8" />
        </div>
      </div>

      <Footer />
    </>
  );
}