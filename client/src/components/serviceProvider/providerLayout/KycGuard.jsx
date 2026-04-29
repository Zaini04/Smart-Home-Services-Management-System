// providerLayout/KycGuard.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function KycGuard({ profileCompleted, kycStatus }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;

    if (!profileCompleted) {
      if (path !== "/provider/complete-profile") {
        navigate("/provider/complete-profile", { replace: true });
      }
      return;
    }

    if (kycStatus === "pending") {
      const allowed = ["/provider/kyc-status"];
      if (!allowed.some((a) => path.startsWith(a))) {
        navigate("/provider/kyc-status", { replace: true });
      }
      return;
    }

    if (kycStatus === "rejected") {
      const allowed = ["/provider/kyc-status", "/provider/edit-profile"];
      if (!allowed.some((a) => path.startsWith(a))) {
        navigate("/provider/kyc-status", { replace: true });
      }
      return;
    }

    if (kycStatus === "approved") {
      const blocked = ["/provider/complete-profile", "/provider/kyc-status"];
      if (blocked.some((b) => path.startsWith(b))) {
        navigate("/provider/dashboard", { replace: true });
      }
    }
  }, [location.pathname, profileCompleted, kycStatus, navigate]);

  return null;
}

export default KycGuard;

