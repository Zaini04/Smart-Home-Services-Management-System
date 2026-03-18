import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaUser,
  FaLock,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCity,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaGoogle,
  FaFacebook,
  FaArrowRight,
  FaArrowLeft,
  FaUserTie,
  FaHome,
  FaShieldAlt,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { signUp } from "../api/authorEndPoints";

/* ------------------ CUSTOM INPUT COMPONENT ------------------ */

const FormInput = ({ 
  icon: Icon, 
  label, 
  type = "text", 
  error, 
  rightElement,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div
        className={`
          relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 
          transition-all duration-300 bg-white
          ${error 
            ? "border-red-300 bg-red-50" 
            : isFocused 
              ? "border-blue-500 shadow-lg shadow-blue-500/10" 
              : "border-gray-200 hover:border-gray-300"
          }
        `}
      >
        {Icon && (
          <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
            isFocused ? "text-blue-500" : "text-gray-400"
          }`} />
        )}
        <input
          type={type}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400"
        />
        {rightElement}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <FaTimesCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ------------------ ROLE CARD COMPONENT ------------------ */

const RoleCard = ({ icon: Icon, title, description, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`
      relative flex-1 p-5 rounded-2xl border-2 text-left transition-all duration-300 transform
      ${isSelected 
        ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10 scale-[1.02]" 
        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
      }
    `}
  >
    <div className={`
      w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
      ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}
    `}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className={`font-semibold mb-1 ${isSelected ? "text-blue-900" : "text-gray-800"}`}>
      {title}
    </h3>
    <p className={`text-sm ${isSelected ? "text-blue-700" : "text-gray-500"}`}>
      {description}
    </p>
    {isSelected && (
      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
        <FaCheck className="w-3 h-3 text-white" />
      </div>
    )}
  </button>
);

/* ------------------ STEP INDICATOR COMPONENT ------------------ */

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }, (_, i) => (
      <React.Fragment key={i}>
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
            transition-all duration-300
            ${i + 1 <= currentStep 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
              : "bg-gray-100 text-gray-400"
            }
          `}
        >
          {i + 1 < currentStep ? <FaCheck className="w-4 h-4" /> : i + 1}
        </div>
        {i < totalSteps - 1 && (
          <div className={`w-12 h-1 rounded-full transition-colors ${
            i + 1 < currentStep ? "bg-blue-600" : "bg-gray-200"
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ------------------ PASSWORD STRENGTH COMPONENT ------------------ */

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= strength ? colors[strength - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength >= 3 ? "text-green-600" : "text-gray-500"}`}>
        Password strength: {labels[strength - 1] || "Too weak"}
      </p>
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState("resident");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const resetFields = () => {
    setRole("resident");
    setPhone("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setAddress("");
    setCity("");
    setCurrentStep(1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return role !== "";
      case 2:
        return name && email && phone;
      case 3:
        return password && confirm && password === confirm && password.length >= 8;
      case 4:
        return address && city && agreed;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError("");
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!agreed) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setError("");
    setLoading(true);

    const payload = {
      full_name: name,
      email,
      phone,
      password,
      role,
      city,
      address,
    };

    try {
      const res = await signUp(payload)
      console.log(res)

      if (res.status === 201) {
        resetFields(); 
        loginUser(res.data.data, res.data.data.accessToken);

        if (res.data.data.role === "serviceprovider") {
          navigate("/provider/complete-profile");
        } else {
          navigate("/allservices");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col justify-center p-8">
            <div className="space-y-6">
              {/* Logo/Brand */}
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FaShieldAlt className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-800">ServiceHub</span>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  Join our growing
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Community
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-md">
                  Create an account to access trusted service providers or offer your services to thousands of customers.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { value: "10K+", label: "Active Users" },
                  { value: "500+", label: "Providers" },
                  { value: "4.9", label: "Avg Rating" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="relative mt-8">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">
                    "ServiceHub connected me with amazing clients. My business has grown 3x since joining!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                      AK
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Ahmed Khan</p>
                      <p className="text-sm text-gray-500">Electrician, Lahore</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                  <FaShieldAlt className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create account</h2>
                <p className="text-gray-500 mt-2">Get started with your free account</p>
              </div>

              {/* Step Indicator */}
              <StepIndicator currentStep={currentStep} totalSteps={4} />

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <FaTimesCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Step 1: Role Selection */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Choose your account type</h3>
                    <div className="flex gap-4">
                      <RoleCard
                        icon={FaHome}
                        title="Resident"
                        description="Find and book trusted service providers"
                        isSelected={role === "resident"}
                        onSelect={() => setRole("resident")}
                      />
                      <RoleCard
                        icon={FaUserTie}
                        title="Provider"
                        description="Offer your services and grow your business"
                        isSelected={role === "serviceprovider"}
                        onSelect={() => setRole("serviceprovider")}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Info */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                    <FormInput
                      icon={FaUser}
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                    />
                    <FormInput
                      icon={FaEnvelope}
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                    />
                    <FormInput
                      icon={FaPhone}
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="03XXXXXXXXX"
                    />
                  </div>
                )}

                {/* Step 3: Password */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Create Password</h3>
                    <div>
                      <FormInput
                        icon={FaLock}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Create a strong password"
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                          </button>
                        }
                      />
                      <PasswordStrength password={password} />
                    </div>
                    <FormInput
                      icon={FaLock}
                      label="Confirm Password"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      error={confirm && password !== confirm ? "Passwords don't match" : ""}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirm ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                        </button>
                      }
                    />
                    {confirm && password === confirm && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <FaCheckCircle className="w-4 h-4" />
                        Passwords match!
                      </p>
                    )}
                  </div>
                )}

                {/* Step 4: Location */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Location Details</h3>
                    <FormInput
                      icon={FaMapMarkerAlt}
                      label="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="House #123, Street 4"
                    />
                    <FormInput
                      icon={FaCity}
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="Enter your city"
                    />
                    
                    {/* Terms Checkbox */}
                    <div className="pt-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">
                          I agree to the{" "}
                          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                          {" "}and{" "}
                          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!validateStep(currentStep)}
                      className={`
                        flex-1 py-4 rounded-xl font-semibold text-white
                        flex items-center justify-center gap-2 transition-all duration-300
                        ${validateStep(currentStep) 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30" 
                          : "bg-gray-300 cursor-not-allowed"
                        }
                      `}
                    >
                      Continue
                      <FaArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !validateStep(4)}
                      className={`
                        flex-1 py-4 rounded-xl font-semibold text-white
                        flex items-center justify-center gap-2 transition-all duration-300
                        ${loading || !validateStep(4)
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                        }
                      `}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="w-5 h-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="w-5 h-5" />
                          Create Account
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

              {/* Social Signup - Only on Step 1 */}
              {currentStep === 1 && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm text-gray-500">or sign up with</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <FaGoogle className="w-5 h-5 text-red-500" />
                      <span className="text-sm">Google</span>
                    </button>
                    <button
                      type="button"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <FaFacebook className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">Facebook</span>
                    </button>
                  </div>
                </>
              )}

              {/* Login Link */}
              <p className="mt-8 text-center text-gray-600">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}