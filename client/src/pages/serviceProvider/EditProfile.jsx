// src/pages/provider/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaIdCard, FaList, FaTools, FaBriefcase, FaDollarSign,
  FaClock, FaCamera, FaUser, FaInfoCircle, FaCheckCircle,
  FaTimesCircle, FaCalendarAlt, FaSpinner, FaExclamationTriangle,
  FaArrowLeft, FaChevronRight
} from "react-icons/fa";
import { toast } from "react-hot-toast";
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
  const queryClient = useQueryClient();

  // Layout Tab State
  const [activeTab, setActiveTab] = useState("personal");

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

  /* ── KYC info ── */
  const [kycStatus, setKycStatus]   = useState("");
  const [kycMessage, setKycMessage] = useState("");
  const [error, setError]           = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
  }, [user, navigate]);

  // Use Queries for Data fetching
  const { data: catData, isLoading: catsLoading } = useQuery({
    queryKey: ["serviceCategories"],
    queryFn: async () => {
      const res = await getCategoriesWithSkills();
      return res.data?.data || [];
    }
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["providerProfile", user?.user_id || user?._id],
    queryFn: async () => {
      const res = await getProviderProfile(user.user_id || user._id);
      return res.data?.data || null;
    },
    enabled: !!user
  });

  const pageLoading = catsLoading || profileLoading;

  // Initialize form state
  useEffect(() => {
    if (catData && profileData) {
      setAllData(catData);
      
      setAge(profileData.age || "");
      setBio(profileData.description || "");
      setCnic(profileData.cnic || "");
      setExperience(profileData.experience || "");
      setVisitPrice(profileData.visitPrice || "");
      setHourlyRate(profileData.hourlyRate || "");

      setKycStatus(profileData.kycStatus || "");
      setKycMessage(profileData.kycStatus === "rejected" ? (profileData.kycMessage || "") : "");

      setCurrentProfileImage(profileData.profileImage || "");
      setCurrentCnicFront(profileData.cnicFrontImage || "");
      setCurrentCnicBack(profileData.cnicBackImage || "");

      const catIds = (profileData.serviceCategories || []).map((c) => c._id || c);
      setSelectedCategories(catIds);

      const relevant = catData.filter((c) => catIds.includes(c._id));
      const skills   = relevant.flatMap((c) => c.subCategories || []);
      setAvailableSkills(skills);

      const skillIds = (profileData.skills || []).map((s) => s._id || s);
      setSelectedSkills(skillIds);
    }
  }, [catData, profileData]);


  // Mutation for Submitting Changes
  const updateMutation = useMutation({
    mutationFn: (fd) => updateProviderProfile(user.user_id || user._id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries(["providerProfile", user?.user_id || user?._id]);
      toast.success("Profile submitted successfully!");
      navigate("/provider/kyc-status", { replace: true });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to update profile.");
      toast.error("Failed to submit profile updates.");
    }
  });

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

  const handleSubmit = (e) => {
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

    const fd = new FormData();

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

    updateMutation.mutate(fd);
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: FaInfoCircle },
    { id: "services", label: "Services & Rates", icon: FaTools },
    { id: "verification", label: "Identity & KYC", icon: FaIdCard },
  ];

  /* ── Loading screen ── */
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-3" />
          <p className="font-bold text-gray-500 text-sm">Loading your profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 px-4 sm:px-6 lg:px-8">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <button
          type="button"
          onClick={() => navigate("/provider/kyc-status")}
          className="p-3.5 rounded-2xl bg-gray-100/80 border border-gray-200
                     hover:bg-gray-200 transition-colors flex-shrink-0 group"
        >
          <FaArrowLeft className="w-4 h-4 text-gray-600 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Edit Profile</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Update your information and resubmit for review
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 items-start relative">
        
        {/* ── Left Sidebar Navigation ── */}
        <div className="w-full md:w-72 flex-shrink-0 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 md:sticky md:top-24">
          <nav className="space-y-2">
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === t.id 
                    ? "bg-gray-900 text-yellow-500 shadow-md shadow-gray-900/10" 
                    : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <t.icon className={`w-5 h-5 ${activeTab === t.id ? "text-yellow-500" : "text-gray-400"}`} />
                  {t.label}
                </div>
                {activeTab === t.id && <FaChevronRight className="w-3 h-3 text-yellow-500/50" />}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-center
                         transition-colors shadow-lg flex items-center justify-center gap-2 ${
                updateMutation.isPending
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                  : "bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-yellow-500/20"
              }`}
            >
              {updateMutation.isPending ? (
                <><FaSpinner className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><FaCheckCircle className="w-4 h-4" /> Save Profile</>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 font-medium mt-3">
              Remember to save after making changes.
            </p>
          </div>
        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 w-full space-y-6">

          {/* ── Rejection Feedback ── */}
          {kycStatus === "rejected" && kycMessage && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6 md:p-8 flex items-start gap-5 shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">Action Required: Profile Update Needed</h3>
                <p className="text-red-800 text-sm leading-relaxed font-medium">{kycMessage}</p>
                <p className="text-red-600 text-xs mt-3 font-semibold tracking-wider uppercase">
                  Please address the above issue and resubmit.
                </p>
              </div>
            </div>
          )}

          {/* ── Submission Error ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4 font-bold shadow-sm">
              <FaTimesCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Tab 1: Personal Info */}
          {activeTab === "personal" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Profile Photo */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                       <FaCamera className="text-gray-500 w-5 h-5" />
                   </div>
                  Display Picture
                </h3>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-40 flex-shrink-0">
                    <FileUploadCard
                      label="Your Photo"
                      icon={<FaUser className="w-8 h-8 text-gray-400" />}
                      file={profileImage}
                      setFile={setProfileImage}
                      currentImage={currentProfileImage}
                    />
                  </div>
                  <div className="text-center sm:text-left sm:mt-4 max-w-sm">
                    <p className="font-bold text-gray-900 mb-2 leading-snug">
                      A clear, professional face picture increases resident trust and bookings.
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Upload a square high-quality image. Keep the background plain and ensure your face is clearly visible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                       <FaInfoCircle className="text-gray-500 w-5 h-5" />
                  </div>
                  Bio & Basic Details
                </h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your expertise, work ethic, and why clients should hire you..."
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50
                               hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:bg-white
                               transition-all outline-none resize-none text-sm font-medium shadow-sm"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
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
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Services & Skills */}
          {activeTab === "services" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Categories */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                       <FaList className="text-gray-500 w-5 h-5" />
                   </div>
                  Service Categories
                </h3>
                <p className="text-gray-500 text-sm font-medium mb-6 ml-14">
                  Select all categories you are qualified to provide services in.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                   <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                       <FaTools className="text-gray-500 w-5 h-5" />
                   </div>
                    Specific Skills
                  </h3>
                  <p className="text-gray-500 text-sm font-medium mb-6 ml-14">
                    Highlight your specific expertise to match with more jobs.
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

              {/* Rates */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                       <FaBriefcase className="text-gray-500 w-5 h-5" />
                   </div>
                  Experience & Pricing Strategy
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
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
                    label="Standard Visit Charge (PKR)"
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={visitPrice}
                    onChange={(e) => setVisitPrice(e.target.value)}
                  />
                  <FormInput
                    icon={FaDollarSign}
                    label="Hourly Rate (PKR) (Optional)"
                    type="number"
                    min="0"
                    placeholder="e.g. 1000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Verification */}
          {activeTab === "verification" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                 <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                       <FaIdCard className="text-gray-500 w-5 h-5" />
                   </div>
                  Platform Identity
                </h3>
                <p className="text-gray-500 text-sm font-medium mb-6 ml-14">
                  For your safety and platform security, your CNIC is required.
                </p>

                <div className="mb-6 max-w-sm">
                  <FormInput
                    icon={FaIdCard}
                    label="CNIC Number"
                    type="text"
                    placeholder="XXXXX-XXXXXXX-X"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
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
            </div>
          )}

        </div>
      </form>
    </div>
  );
}