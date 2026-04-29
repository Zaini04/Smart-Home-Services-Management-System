// providerLayout/providerNavConstants.js
import {
  FaHome, FaSearch, FaBell, FaBriefcase, FaCalendarAlt,
  FaComments, FaWallet, FaUser, FaEdit, FaTools, FaExclamationCircle,
  FaIdCard, FaShieldAlt
} from "react-icons/fa";

export const approvedNavItems = [
  { to: "/provider/dashboard",      icon: FaHome,      label: "Dashboard",      end: true },
  { to: "/provider/available-jobs", icon: FaSearch,    label: "Available Jobs" },
  { to: "/provider/my-offers",      icon: FaBell,      label: "My Offers" },
  { to: "/provider/my-jobs",        icon: FaBriefcase, label: "My Jobs" },
  { action: "calendar",             icon: FaCalendarAlt, label: "Calendar" },
  { action: "notifications",        icon: FaBell,      label: "Notifications" },
  { to: "/provider/chat",           icon: FaComments,  label: "Messages" },
  { to: "/provider/wallet",         icon: FaWallet,    label: "Wallet" },
  { to: "/provider/profile",        icon: FaUser,      label: "My Profile" },
  { to: "/provider/edit-profile",   icon: FaEdit,      label: "Edit Profile" },
  { to: "/provider/settings",       icon: FaTools,    label: "Settings" },
  { to: "/provider/support",       icon: FaExclamationCircle, label: "Support" },
];

export function getNavItems(profileCompleted, kycStatus) {
  if (!profileCompleted) {
    return [{ to: "/provider/complete-profile", icon: FaIdCard, label: "Complete Profile", highlight: true }];
  }
  if (kycStatus === "pending") {
    return [{ to: "/provider/kyc-status", icon: FaShieldAlt, label: "KYC Status" }];
  }
  if (kycStatus === "rejected") {
    return [
      { to: "/provider/kyc-status",     icon: FaShieldAlt, label: "KYC Status" },
      { to: "/provider/edit-profile",   icon: FaEdit,      label: "Edit Profile" },
    ];
  }
  return approvedNavItems;
}

