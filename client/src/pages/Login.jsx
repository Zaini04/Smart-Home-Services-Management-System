import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/authorEndPoints";

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
          relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 
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
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors ${
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
          className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base"
        />
        {rightElement}
      </div>
      {error && (
        <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1">
          <FaTimesCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login({email,password})
      const data = res.data.data;
      loginUser(data, data.accessToken);

      if (data.role === "resident") {
        navigate("/allservices");
      } else if (data.role === "serviceprovider") {
        navigate("/provider/kyc-status");
      } else if(data.role === 'admin'){
        navigate('/admin')
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col justify-center p-6 xl:p-8">
            <div className="space-y-6">
              {/* Logo/Brand */}
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FaShieldAlt className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-800">HomeFix</span>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-3xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  Welcome back to
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    HomeFix
                  </span>
                </h1>
                <p className="text-base xl:text-lg text-gray-600 max-w-md">
                  Connect with trusted service providers in your area. Quality services at your fingertips.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6">
                {[
                  { title: "Verified Providers", desc: "All providers are background checked" },
                  { title: "Secure Payments", desc: "Your transactions are protected" },
                  { title: "24/7 Support", desc: "We're here to help anytime" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FaCheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{feature.title}</p>
                      <p className="text-sm text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Element */}
              <div className="relative mt-8">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                        >
                          {["JD", "AK", "MS", "RK"][i - 1]}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">10,000+ Users</p>
                      <p className="text-sm text-gray-500">Trust our platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-gray-200/50 p-6 sm:p-8 lg:p-10 border border-gray-100">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                  <FaShieldAlt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Sign in</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-2">Welcome back! Please enter your details.</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 sm:gap-3">
                  <FaTimesCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm sm:text-base font-medium text-red-800">Login failed</p>
                    <p className="text-xs sm:text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative my-4 sm:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 sm:px-4 text-xs sm:text-sm text-gray-500">Continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
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
                  icon={FaLock}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash className="w-4 h-4 sm:w-5 sm:h-5" /> : <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  }
                />

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    w-full py-3 sm:py-4 rounded-xl font-semibold text-white text-sm sm:text-base
                    flex items-center justify-center gap-2 transition-all duration-300
                    ${loading 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <p className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-500 mt-4 sm:mt-6 px-4">
              By signing in, you agree to our{" "}
              <a href="#" className="underline hover:text-gray-700">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}