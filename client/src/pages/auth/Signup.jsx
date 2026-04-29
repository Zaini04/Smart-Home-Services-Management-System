import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import {
  FaUser, FaLock, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaCity, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle,
  FaTimesCircle, FaArrowRight, FaArrowLeft, FaUserTie,
  FaHome, FaShieldAlt
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { signUp, verifyEmailOTP } from "../../api/authorEndPoints";
import { toast } from "react-hot-toast";

import { FormInput } from "../../components/ui/FormInput";
import { RoleCard } from "../../components/auth/RoleCard";
import { StepIndicator } from "../../components/auth/StepIndicator";
import { PasswordStrength } from "../../components/auth/PasswordStrength";

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState("resident");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const validateStep = (step) => {
    switch (step) {
      case 1: return role !== "";
      case 2: return name && email && phone;
      case 3: return password && confirm && password === confirm && password.length >= 8;
      case 4: return address && city && agreed;
      case 5: return otp.length === 4;
      default: return false;
    }
  };

  const handleNext = () => { if (validateStep(currentStep)) { setCurrentStep(currentStep + 1); setError(""); } };
  const handleBack = () => { setCurrentStep(currentStep - 1); setError(""); };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match");
    if (!agreed) return setError("Please agree to the terms and conditions");
    setError(""); setLoading(true);

    try {
      const res = await signUp({ full_name: name, email, phone, password, role, city, address });
      if (res.status === 201) {
        toast.success("OTP sent to your email!");
        setCurrentStep(5);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await verifyEmailOTP({ email, otp });
      if (res.status === 200) {
        toast.success("Account verified & created successfully!");
        const userData = res.data.data;
        loginUser(userData, userData.accessToken);
        if (userData.role === "serviceprovider") navigate("/provider/complete-profile");
        else navigate("/allservices");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div className="hidden lg:flex flex-col justify-center p-6 xl:p-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FaShieldAlt className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-800">HomeFix</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl xl:text-5xl font-bold text-gray-900 leading-tight">Join our growing<span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Community</span></h1>
                <p className="text-base xl:text-lg text-gray-600 max-w-md">Create an account to access trusted service providers or offer your services to thousands of customers.</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[{ value: "10K+", label: "Active Users" }, { value: "500+", label: "Providers" }, { value: "4.9", label: "Avg Rating" }].map((stat, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{stat.value}</p><p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="relative mt-8">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                  <div className="flex gap-1 mb-3">{[1, 2, 3, 4, 5].map((i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}</div>
                  <p className="text-gray-700 italic mb-4">"HomeFix connected me with amazing clients. My business has grown 3x since joining!"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium">AK</div>
                    <div><p className="font-medium text-gray-800">Ahmed Khan</p><p className="text-sm text-gray-500">Electrician, Lahore</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-gray-200/50 p-6 sm:p-8 lg:p-10 border border-gray-100">
              <div className="text-center mb-4 sm:mb-6">
                <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                  <FaShieldAlt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{currentStep === 5 ? "Verify Email" : "Create account"}</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-2">{currentStep === 5 ? `Enter the code sent to ${email}` : "Get started with your free account"}</p>
              </div>
              {currentStep <= 5 && <StepIndicator currentStep={currentStep} totalSteps={5} />}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 sm:gap-3">
                  <FaTimesCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div><p className="text-sm sm:text-base font-medium text-red-800">Error</p><p className="text-xs sm:text-sm text-red-600">{error}</p></div>
                </div>
              )}
              <form onSubmit={currentStep === 5 ? handleVerifyOTP : handleSignupSubmit} className="space-y-4 sm:space-y-5">
                {currentStep === 1 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Choose your account type</h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <RoleCard icon={FaHome} title="Resident" description="Find and book trusted service providers" isSelected={role === "resident"} onSelect={() => setRole("resident")} />
                      <RoleCard icon={FaUserTie} title="Provider" description="Offer your services and grow your business" isSelected={role === "serviceprovider"} onSelect={() => setRole("serviceprovider")} />
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Personal Information</h3>
                    <FormInput icon={FaUser} label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your full name" />
                    <FormInput icon={FaEnvelope} label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
                    <FormInput icon={FaPhone} label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="03XXXXXXXXX" />
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Create Password</h3>
                    <div>
                      <FormInput icon={FaLock} label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a strong password" rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <FaEyeSlash className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />}</button>} />
                      <PasswordStrength password={password} />
                    </div>
                    <FormInput icon={FaLock} label="Confirm Password" type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Confirm your password" error={confirm && password !== confirm ? "Passwords don't match" : ""} rightElement={<button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 transition-colors">{showConfirm ? <FaEyeSlash className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />}</button>} />
                    {confirm && password === confirm && <p className="text-xs sm:text-sm text-green-600 flex items-center gap-1"><FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Passwords match!</p>}
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Location Details</h3>
                    <FormInput icon={FaMapMarkerAlt} label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="House #123, Street 4" />
                    <FormInput icon={FaCity} label="City" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Enter your city" />
                    <div className="pt-2 sm:pt-4">
                      <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-xs sm:text-sm text-gray-600">I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a></span>
                      </label>
                    </div>
                  </div>
                )}
                {currentStep === 5 && (
                  <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
                    <div className="flex justify-center mb-2"><div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center"><FaEnvelope className="text-2xl sm:text-3xl text-blue-500" /></div></div>
                    <div>
                      <label className="block text-center text-sm font-medium text-gray-700 mb-3">Enter 4-Digit Code</label>
                      <input type="text" required maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-2xl sm:text-3xl tracking-[0.5em] sm:tracking-[1em] font-bold py-3 sm:py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="••••" />
                    </div>
                  </div>
                )}
                <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                  {currentStep > 1 && currentStep < 5 && <button type="button" onClick={handleBack} className="flex-1 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"><FaArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Back</span></button>}
                  {currentStep < 4 && <button type="button" onClick={handleNext} disabled={!validateStep(currentStep)} className={`flex-1 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-all duration-300 ${validateStep(currentStep) ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30" : "bg-gray-300 cursor-not-allowed"}`}>Continue <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" /></button>}
                  {currentStep === 4 && <button type="submit" disabled={loading || !validateStep(4)} className={`flex-1 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-all duration-300 ${loading || !validateStep(4) ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30"}`}>{loading ? <><FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> <span className="hidden sm:inline">Sending...</span></> : <><FaEnvelope className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Send Code</span><span className="sm:hidden">Send</span></>}</button>}
                  {currentStep === 5 && <button type="submit" disabled={loading || otp.length !== 4} className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white flex items-center justify-center gap-2 transition-all duration-300 ${loading || otp.length !== 4 ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"}`}>{loading ? <><FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Verifying...</> : <><FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Verify & Create</>}</button>}
                </div>
              </form>
              {currentStep < 5 && <p className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-600">Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign in</Link></p>}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
