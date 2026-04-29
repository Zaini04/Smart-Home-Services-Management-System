// profile/CompleteProfile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaIdCard, FaList, FaTools, FaBriefcase, FaDollarSign, FaClock, FaCamera, FaUser, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaSpinner, FaSignOutAlt } from "react-icons/fa";
import { completeProfile, getCategoriesWithSkills } from "../../api/serviceProviderEndPoints";
import { FileUploadCard, CategoryCard, SkillChip, FormInput, isValidObjectId } from "../../components/provider/providerSharedComponents";

export default function CompleteProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [cnic, setCnic] = useState("");
  const [experience, setExperience] = useState("");
  const [visitPrice, setVisitPrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const [allData, setAllData] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [profileImage, setProfileImage] = useState(null);
  const [cnicFrontImage, setCnicFrontImage] = useState(null);
  const [cnicBackImage, setCnicBackImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { if (!user) navigate("/login"); else fetchCategories(); }, [user]);

  const fetchCategories = async () => {
    try {
      setDataLoading(true);
      const res = await getCategoriesWithSkills();
      setAllData((res.data.data || []).filter(c => c._id && isValidObjectId(c._id)));
    } catch {
      setError("Failed to load categories. Please refresh.");
    } finally {
      setDataLoading(false);
    }
  };

  const toggleCategory = (id) => {
    if (!isValidObjectId(id)) return;
    const next = selectedCategories.includes(id) ? selectedCategories.filter(c => c !== id) : [...selectedCategories, id];
    setSelectedCategories(next);
    const relevant = allData.filter(c => next.includes(c._id));
    const skills = relevant.flatMap(c => (c.subCategories || []).filter(s => s._id && isValidObjectId(s._id)));
    setAvailableSkills(skills);
    setSelectedSkills(prev => prev.filter(sk => skills.some(s => s._id === sk)));
  };

  const toggleSkill = (id) => {
    if (!isValidObjectId(id)) return;
    setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedCategories.length) return setError("Please select at least one service category.");
    if (!selectedSkills.length) return setError("Please select at least one skill.");
    if (!profileImage || !cnicFrontImage || !cnicBackImage) return setError("Please upload all required images.");

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("userId", user.user_id || user._id);
      fd.append("age", age);
      fd.append("description", bio);
      fd.append("cnic", cnic);
      fd.append("experience", experience);
      fd.append("visitPrice", visitPrice);
      fd.append("hourlyRate", hourlyRate);
      fd.append("serviceCategories", JSON.stringify(selectedCategories));
      fd.append("skills", JSON.stringify(selectedSkills));
      fd.append("profileImage", profileImage);
      fd.append("cnicFront", cnicFrontImage);
      fd.append("cnicBack", cnicBackImage);

      await completeProfile(fd);
      navigate("/provider/kyc-status", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const progressItems = [age, bio, cnic, experience, visitPrice, hourlyRate, selectedCategories.length > 0, selectedSkills.length > 0, profileImage, cnicFrontImage && cnicBackImage];
  const progress = Math.round((progressItems.filter(Boolean).length / progressItems.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow"><FaTools className="w-4 h-4 text-white" /></div>
            <div><p className="font-bold text-gray-800 text-sm">Complete Your Profile</p><p className="text-xs text-gray-400">Step 1 of 2 — Profile Setup</p></div>
          </div>
          <button type="button" onClick={() => { logout(); navigate("/login"); }} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
            <FaSignOutAlt className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        <div className="h-1.5 bg-gray-100"><div className={`h-full transition-all duration-500 ease-out ${progress === 100 ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`} style={{ width: `${progress}%` }} /></div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg"><FaUser className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Complete Your Provider Profile</h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">Fill in your details to start receiving service requests. All fields marked <span className="text-red-500">*</span> are required.</p>
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mt-3 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${progress === 100 ? "bg-green-500" : "bg-blue-500 animate-pulse"}`} /><span className="text-sm font-semibold text-gray-700">{progress}% complete</span>
          </div>
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 flex items-start gap-3"><FaTimesCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /><p className="text-red-700 text-sm">{error}</p></div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><FaCamera className="text-blue-600" />Profile Photo<span className="text-red-500">*</span></h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-36 flex-shrink-0"><FileUploadCard label="Your Photo" icon={<FaUser className="w-8 h-8 text-gray-400" />} file={profileImage} setFile={setProfileImage} required /></div>
              <div className="text-center sm:text-left"><p className="font-medium text-gray-700 mb-1 text-sm">Upload a professional photo</p><p className="text-gray-500 text-xs leading-relaxed">Use a clear, front-facing photo with good lighting. A professional photo helps build trust with customers.</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2"><FaInfoCircle className="text-blue-600" />Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormInput icon={FaCalendarAlt} label="Age *" type="number" required min="18" max="70" placeholder="Enter your age" value={age} onChange={(e) => setAge(e.target.value)} />
              <FormInput icon={FaIdCard} label="CNIC Number *" type="text" required placeholder="XXXXX-XXXXXXX-X" value={cnic} onChange={(e) => setCnic(e.target.value)} />
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">About You *</label>
              <textarea rows={4} required value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your experience, specialties, and why customers should choose you..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:shadow-md transition-all outline-none resize-none text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2"><FaList className="text-blue-600" />Service Categories *</h3>
            <p className="text-gray-400 text-xs mb-5">Select all categories you can provide services in</p>
            {dataLoading ? <div className="flex items-center justify-center py-10 gap-3"><FaSpinner className="animate-spin text-blue-500 text-2xl" /><span className="text-gray-500 text-sm">Loading categories...</span></div> : allData.length === 0 ? <p className="text-red-500 text-sm">No categories available. Contact admin.</p> : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">{allData.map(cat => <CategoryCard key={cat._id} category={cat} isSelected={selectedCategories.includes(cat._id)} onToggle={() => toggleCategory(cat._id)} />)}</div>}
          </div>

          {availableSkills.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2"><FaTools className="text-blue-600" />Your Skills *</h3>
              <p className="text-gray-400 text-xs mb-5">Select specific skills from your chosen categories</p>
              <div className="flex flex-wrap gap-2">{availableSkills.map(skill => <SkillChip key={skill._id} skill={skill} isSelected={selectedSkills.includes(skill._id)} onToggle={() => toggleSkill(skill._id)} />)}</div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2"><FaBriefcase className="text-blue-600" />Experience & Pricing</h3>
            <div className="grid sm:grid-cols-3 gap-5">
              <FormInput icon={FaClock} label="Years of Experience" type="number" min="0" max="50" placeholder="e.g. 5" value={experience} onChange={(e) => setExperience(e.target.value)} />
              <FormInput icon={FaDollarSign} label="Visit Charge (PKR)" type="number" min="0" placeholder="e.g. 500" value={visitPrice} onChange={(e) => setVisitPrice(e.target.value)} />
              <FormInput icon={FaClock} label="Hourly Rate (PKR)" type="number" min="0" placeholder="e.g. 1000" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2"><FaIdCard className="text-blue-600" />Identity Verification *</h3>
            <p className="text-gray-400 text-xs mb-5">Upload clear photos of both sides of your CNIC for verification</p>
            <div className="grid sm:grid-cols-2 gap-6">
              <FileUploadCard label="CNIC Front Side" icon={<FaIdCard className="w-8 h-8 text-gray-400" />} file={cnicFrontImage} setFile={setCnicFrontImage} required />
              <FileUploadCard label="CNIC Back Side" icon={<FaIdCard className="w-8 h-8 text-gray-400" />} file={cnicBackImage} setFile={setCnicBackImage} required />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <button type="submit" disabled={loading || dataLoading} className={`w-full py-4 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-300 ${loading || dataLoading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5"}`}>
              {loading ? <><FaSpinner className="w-5 h-5 animate-spin" /> Submitting...</> : <><FaCheckCircle className="w-5 h-5" /> Submit Profile for Review</>}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">By submitting you agree to our Terms of Service</p>
          </div>
        </form>
        <div className="h-10" />
      </div>
    </div>
  );
}

