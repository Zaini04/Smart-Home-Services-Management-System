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
} from "react-icons/fa";
import { completeProfile, getCategoriesWithSkills } from "../../api/serviceProviderEndPoints";

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
        relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform w-full text-left flex items-center gap-3
        ${isSelected 
          ? `bg-blue-50 border-blue-500 text-blue-700 shadow-md scale-[1.02] border-2` 
          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
        }
      `}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold
           ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
           {category.name.charAt(0).toUpperCase()}
      </div>
      <span className="font-medium">{category.name}</span>
      
      {isSelected && (
        <FaCheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-500" />
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
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform border
        ${isSelected 
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md scale-105" 
          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        }
      `}
    >
      {isSelected && <FaCheckCircle className="inline-block w-3 h-3 mr-2" />}
      {skill.name}
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

/* ------------------ HELPER FUNCTION ------------------ */

// ✅ Check if string is valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [cnic, setCnic] = useState("");
  const [experience, setExperience] = useState("");
  const [visitPrice, setVisitPrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  // Categories & Skills State
  const [allData, setAllData] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // ✅ Array of ObjectId strings
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]); // ✅ Array of ObjectId strings

  // Files
  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------------ FETCH DATA ON MOUNT ------------------ */
  useEffect(() => {
    // ✅ Reset all selections on mount
    setSelectedCategories([]);
    setSelectedSkills([]);
    setAvailableSkills([]);

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const res = await getCategoriesWithSkills();
        const data = res.data.data || [];
        
        // ✅ Debug: Log to verify data structure
        console.log("Categories from API:", data);
        
        // ✅ Validate that each category has _id
        const validData = data.filter(cat => cat._id && isValidObjectId(cat._id));
        
        if (validData.length !== data.length) {
          console.warn("Some categories have invalid or missing _id");
        }
        
        setAllData(validData);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setError("Failed to load service categories. Please refresh the page.");
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ------------------ HANDLE CATEGORY SELECTION ------------------ */
  const toggleCategory = (categoryId) => {
    // ✅ Validate categoryId is a proper ObjectId
    if (!isValidObjectId(categoryId)) {
      console.error("Invalid category ID:", categoryId);
      return;
    }

    let newCategories;
    
    if (selectedCategories.includes(categoryId)) {
      newCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      newCategories = [...selectedCategories, categoryId];
    }
    
    // ✅ Debug log
    console.log("Selected Category IDs:", newCategories);
    
    setSelectedCategories(newCategories);

    // Update Available Skills based on selected Category IDs
    const relevantCats = allData.filter(cat => newCategories.includes(cat._id));
    let newAvailableSkills = [];
    
    relevantCats.forEach(cat => {
      if (cat.subCategories && cat.subCategories.length > 0) {
        // ✅ Only add skills with valid _id
        const validSkills = cat.subCategories.filter(skill => skill._id && isValidObjectId(skill._id));
        newAvailableSkills = [...newAvailableSkills, ...validSkills];
      }
    });
    
    setAvailableSkills(newAvailableSkills);

    // Clean up selected skills
    const newAvailableSkillIds = newAvailableSkills.map(s => s._id);
    setSelectedSkills(prev => prev.filter(sId => newAvailableSkillIds.includes(sId)));
  };

  /* ------------------ HANDLE SKILL SELECTION ------------------ */
  const toggleSkill = (skillId) => {
    // ✅ Validate skillId is a proper ObjectId
    if (!isValidObjectId(skillId)) {
      console.error("Invalid skill ID:", skillId);
      return;
    }

    setSelectedSkills(prev => {
      const newSkills = prev.includes(skillId) 
        ? prev.filter(id => id !== skillId) 
        : [...prev, skillId];
      
      // ✅ Debug log
      console.log("Selected Skill IDs:", newSkills);
      
      return newSkills;
    });
  };

  /* ------------------ SUBMIT HANDLER ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // --- Validation ---
    if (selectedCategories.length === 0) {
      setError("Please select at least one service category.");
      setLoading(false);
      return;
    }
    if (selectedSkills.length === 0) {
      setError("Please select at least one skill.");
      setLoading(false);
      return;
    }
    if (!profileImage || !cnicFrontImage || !cnicBackImage) {
      setError("Please upload all required images (Profile, CNIC Front & Back).");
      setLoading(false);
      return;
    }

    // ✅ Final validation before submit
    const invalidCats = selectedCategories.filter(id => !isValidObjectId(id));
    const invalidSkills = selectedSkills.filter(id => !isValidObjectId(id));

    if (invalidCats.length > 0 || invalidSkills.length > 0) {
      console.error("Invalid IDs found:", { invalidCats, invalidSkills });
      setError("Invalid selection detected. Please refresh and try again.");
      setLoading(false);
      return;
    }

    // ✅ Debug: Log final data being sent
    console.log("=== SUBMITTING ===");
    console.log("Categories:", selectedCategories);
    console.log("Skills:", selectedSkills);
    console.log("==================");

    try {
      const formData = new FormData();
      formData.append("userId", user.user_id || user._id);
      formData.append("age", age);
      formData.append("description", bio);
      formData.append("cnic", cnic);
      formData.append("experience", experience);
      formData.append("visitPrice", visitPrice);
      formData.append("hourlyRate", hourlyRate);
      
      // ✅ Send arrays as JSON strings (containing only valid ObjectId strings)
      formData.append("serviceCategories", JSON.stringify(selectedCategories));
      formData.append("skills", JSON.stringify(selectedSkills));
      
      formData.append("cnicFront", cnicFrontImage);
      formData.append("cnicBack", cnicBackImage);
      formData.append("profileImage", profileImage);

      await completeProfile(formData);
      navigate("/kyc-status");
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.response?.data?.message || "Profile submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Progress Bar Logic
  const calculateProgress = () => {
    let filled = 0;
    const total = 10;
    if (age) filled++;
    if (bio) filled++;
    if (cnic) filled++;
    if (selectedCategories.length > 0) filled++;
    if (selectedSkills.length > 0) filled++;
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
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                </p>
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
                placeholder="Tell customers about yourself, your experience, specialties..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 
                         hover:border-gray-300 focus:border-blue-500 focus:bg-white 
                         focus:shadow-md transition-all duration-200 outline-none resize-none"
              />
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

            {dataLoading ? (
              <div className="flex justify-center py-6">
                <FaSpinner className="animate-spin text-blue-500 text-2xl" />
              </div>
            ) : allData.length === 0 ? (
              <p className="text-red-500">No categories found. Please contact admin.</p>
            ) : (
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
            )}
          </div>

          {/* Skills Section */}
          {availableSkills.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FaTools className="text-blue-600" />
                Your Skills
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Select specific skills from the categories you chose above
              </p>

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
          </div>

          {/* CNIC Documents */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaIdCard className="text-blue-600" />
              Identity Verification
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mt-4">
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
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-5 h-5" />
                  Submit Profile for Review
                </>
              )}
            </button>
          </div>
        </form>
        <div className="h-8" />
      </div>

      <Footer />
    </>
  );
}