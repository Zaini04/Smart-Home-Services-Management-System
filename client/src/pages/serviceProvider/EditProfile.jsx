// src/pages/provider/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaIdCard, FaList, FaTools, FaBriefcase, FaDollarSign,
  FaClock, FaCamera, FaUser, FaInfoCircle, FaCheckCircle,
  FaTimesCircle, FaCalendarAlt, FaSpinner, FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import {
  getCategoriesWithSkills,
  getProviderProfile,
  updateProviderProfile,
} from "../../api/serviceProviderEndPoints";
import {
  FileUploadCard, CategoryCard, SkillChip,
  FormInput, isValidObjectId,
} from "../../components/provider/providerSharedComponents";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── Form fields ── */
  const [age, setAge]               = useState("");
  const [bio, setBio]               = useState("");
  const [cnic, setCnic]             = useState("");
  const [experience, setExperience] = useState("");
  const [visitPrice, setVisitPrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  /* ── Existing images (server paths) ── */
  const [currentProfileImage, setCurrentProfileImage] = useState("");
  const [currentCnicFront, setCurrentCnicFront]       = useState("");
  const [currentCnicBack, setCurrentCnicBack]         = useState("");

  /* ── New files ── */
  const [profileImage, setProfileImage]     = useState(null);
  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage]   = useState(null);

  /* ── Categories & skills ── */
  const [allData, setAllData]                       = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableSkills, setAvailableSkills]       = useState([]);
  const [selectedSkills, setSelectedSkills]         = useState([]);

  /* ── KYC info — only show rejection feedback when rejected ── */
  const [kycStatus, setKycStatus]   = useState("");
  const [kycMessage, setKycMessage] = useState("");

  /* ── UI ── */
  const [loading, setLoading]           = useState(false);
  const [pageLoading, setPageLoading]   = useState(true);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setPageLoading(true);
      const userId = user.user_id || user._id;

      const [catRes, profileRes] = await Promise.all([
        getCategoriesWithSkills(),
        getProviderProfile(userId),
      ]);

      const categories = catRes.data?.data || [];
      setAllData(categories);

      const profile = profileRes.data?.data;
      if (!profile) {
        navigate("/provider/complete-profile", { replace: true });
        return;
      }

      /* Populate form */
      setAge(profile.age || "");
      setBio(profile.description || "");
      setCnic(profile.cnic || "");
      setExperience(profile.experience || "");
      setVisitPrice(profile.visitPrice || "");
      setHourlyRate(profile.hourlyRate || "");

      /* 
        KYC — only store rejection message if actually rejected.
        If approved or pending, no feedback to show.
      */
      setKycStatus(profile.kycStatus || "");
      setKycMessage(
        profile.kycStatus === "rejected" ? (profile.kycMessage || "") : ""
      );

      /* Images */
      setCurrentProfileImage(profile.profileImage || "");
      setCurrentCnicFront(profile.cnicFrontImage || "");
      setCurrentCnicBack(profile.cnicBackImage || "");

      /* Selected categories */
      const catIds = (profile.serviceCategories || []).map((c) => c._id || c);
      setSelectedCategories(catIds);

      /* Available skills from selected categories */
      const relevant = categories.filter((c) => catIds.includes(c._id));
      const skills   = relevant.flatMap((c) => c.subCategories || []);
      setAvailableSkills(skills);

      /* Selected skills */
      const skillIds = (profile.skills || []).map((s) => s._id || s);
      setSelectedSkills(skillIds);

    } catch (err) {
      console.error(err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setPageLoading(false);
    }
  };

  const toggleCategory = (id) => {
    if (!isValidObjectId(id)) return;
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    setSelectedCategories(next);

    const relevant = allData.filter((c) => next.includes(c._id));
    const skills   = relevant.flatMap((c) => c.subCategories || []);
    setAvailableSkills(skills);
    setSelectedSkills((prev) =>
      prev.filter((sk) => skills.some((s) => s._id === sk))
    );
  };

  const toggleSkill = (id) => {
    if (!isValidObjectId(id)) return;
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCategories.length) {
      setError("Please select at least one category.");
      return;
    }
    if (!selectedSkills.length) {
      setError("Please select at least one skill.");
      return;
    }

    try {
      setLoading(true);
      const userId = user.user_id || user._id;
      const fd     = new FormData();

      fd.append("age",              age);
      fd.append("description",      bio);
      fd.append("cnic",             cnic);
      fd.append("experience",       experience);
      fd.append("visitPrice",       visitPrice);
      fd.append("hourlyRate",       hourlyRate);
      fd.append("serviceCategories", JSON.stringify(selectedCategories));
      fd.append("skills",           JSON.stringify(selectedSkills));

      if (profileImage)    fd.append("profileImage", profileImage);
      if (cnicFrontImage)  fd.append("cnicFront",    cnicFrontImage);
      if (cnicBackImage)   fd.append("cnicBack",     cnicBackImage);

      await updateProviderProfile(userId, fd);
      navigate("/provider/kyc-status", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading screen ── */
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    /* 
      No Navbar/Footer — this is inside ProviderLayout <Outlet>.
      Content scrolls via the layout's <main> scroll container.
    */
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/provider/kyc-status")}
          className="p-2.5 rounded-xl bg-white border border-gray-200
                     hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <FaArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
          <p className="text-gray-500 text-sm">
            Update your information and resubmit for review
          </p>
        </div>
      </div>

      {/* ── Rejection Feedback (ONLY shown when kycStatus === "rejected") ── */}
      {kycStatus === "rejected" && kycMessage && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5
                        flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center
                          justify-center flex-shrink-0">
            <FaExclamationTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-800 mb-1">
              Admin Feedback — Action Required
            </h3>
            <p className="text-red-700 text-sm leading-relaxed">
              {kycMessage}
            </p>
            <p className="text-red-500 text-xs mt-2">
              Please address the above issue and resubmit your profile.
            </p>
          </div>
        </div>
      )}

      {/* ── Submission Error ── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl
                        flex items-start gap-3">
          <FaTimesCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Profile Photo */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-4
                         flex items-center gap-2">
            <FaCamera className="text-blue-600" />
            Profile Photo
          </h3>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-36 flex-shrink-0">
              <FileUploadCard
                label="Your Photo"
                icon={<FaUser className="w-8 h-8 text-gray-400" />}
                file={profileImage}
                setFile={setProfileImage}
                currentImage={currentProfileImage}
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-medium text-gray-700 text-sm mb-1">
                Update your profile photo
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Leave unchanged to keep your current photo.
                Upload a new image to replace it.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-5
                         flex items-center gap-2">
            <FaInfoCircle className="text-blue-600" />
            Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <FormInput
              icon={FaCalendarAlt}
              label="Age"
              type="number"
              min="18"
              max="70"
              placeholder="Your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <FormInput
              icon={FaIdCard}
              label="CNIC Number"
              type="text"
              placeholder="XXXXX-XXXXXXX-X"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
            />
          </div>
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About You
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your experience..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50
                         hover:border-gray-300 focus:border-blue-500 focus:bg-white
                         focus:shadow-md transition-all outline-none resize-none text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-1
                         flex items-center gap-2">
            <FaList className="text-blue-600" />
            Service Categories
          </h3>
          <p className="text-gray-400 text-xs mb-5">
            Select all categories you can provide services in
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-1
                           flex items-center gap-2">
              <FaTools className="text-blue-600" />
              Your Skills
            </h3>
            <p className="text-gray-400 text-xs mb-5">
              Select skills from your chosen categories
            </p>
            <div className="flex flex-wrap gap-2">
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
          <h3 className="text-base font-semibold text-gray-800 mb-5
                         flex items-center gap-2">
            <FaBriefcase className="text-blue-600" />
            Experience & Pricing
          </h3>
          <div className="grid sm:grid-cols-3 gap-5">
            <FormInput
              icon={FaClock}
              label="Years of Experience"
              type="number"
              min="0"
              placeholder="e.g. 5"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
            <FormInput
              icon={FaDollarSign}
              label="Visit Charge (PKR)"
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={visitPrice}
              onChange={(e) => setVisitPrice(e.target.value)}
            />
            <FormInput
              icon={FaClock}
              label="Hourly Rate (PKR)"
              type="number"
              min="0"
              placeholder="e.g. 1000"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>
        </div>

        {/* CNIC */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-1
                         flex items-center gap-2">
            <FaIdCard className="text-blue-600" />
            Identity Documents
          </h3>
          <p className="text-gray-400 text-xs mb-5">
            Keep existing images or upload new ones to replace them
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <FileUploadCard
              label="CNIC Front Side"
              icon={<FaIdCard className="w-8 h-8 text-gray-400" />}
              file={cnicFrontImage}
              setFile={setCnicFrontImage}
              currentImage={currentCnicFront}
            />
            <FileUploadCard
              label="CNIC Back Side"
              icon={<FaIdCard className="w-8 h-8 text-gray-400" />}
              file={cnicBackImage}
              setFile={setCnicBackImage}
              currentImage={currentCnicBack}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base
                       flex items-center justify-center gap-3 transition-all duration-300 ${
              loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <><FaSpinner className="w-5 h-5 animate-spin" /> Updating...</>
            ) : (
              <><FaCheckCircle className="w-5 h-5" /> Resubmit Profile for Review</>
            )}
          </button>
        </div>
      </form>
      <div className="h-4" />
    </div>
  );
}