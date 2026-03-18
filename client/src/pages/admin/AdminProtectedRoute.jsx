import { Navigate, useLocation } from "react-router-dom";
import { FaSpinner, FaShieldAlt } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Optional: Add loading state if checking auth async
  // const [loading, setLoading] = useState(true);

  if (!accessToken || user?.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Enhanced version with loading state
export function AdminProtectedRouteWithLoading({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem("accessToken");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      
      if (accessToken && user?.role === "admin") {
        setIsAuthorized(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30 animate-pulse">
            <FaShieldAlt className="w-10 h-10 text-white" />
          </div>
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}