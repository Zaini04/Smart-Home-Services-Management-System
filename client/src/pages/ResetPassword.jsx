import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaLock, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { resetPassword } from "../api/authorEndPoints";
import { toast } from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams(); // Gets the token from the URL
  const navigate = useNavigate();
  
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    try {
      await resetPassword(token, { newPassword: passwords.newPassword });
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000); // Redirect after 3s
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create new password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Please enter your new password below.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          
          {success ? (
            <div className="text-center space-y-4">
              <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">Success!</h3>
              <p className="text-sm text-gray-500">Your password has been reset. Redirecting to login...</p>
              <Link to="/login" className="mt-4 w-full flex justify-center py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-all">
                Login Now
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password" required minLength="6"
                    value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password" required minLength="6"
                    value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70">
                {loading ? <FaSpinner className="animate-spin w-5 h-5" /> : "Save New Password"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}