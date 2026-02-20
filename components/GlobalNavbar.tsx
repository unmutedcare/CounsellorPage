import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, ChevronLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import logo from "@/src/assets/unmutedlogo.webp";

const GlobalNavbar: React.FC = () => {
  const { isAuthenticated, role, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/role-select" ||
    location.pathname === "/student/login" ||
    location.pathname === "/counsellor/login" ||
    location.pathname === "/student/signup" ||
    location.pathname === "/verify-email";

  const isDashboard = 
    location.pathname === "/student/dashboard" || 
    location.pathname === "/counsellor/dashboard";

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/role-select";

  if (hideNavbar) return null;
  if (isAuthPage && !isAuthenticated) return null;

  const handleLogoClick = () => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    if (role === "STUDENT") {
      navigate("/student/dashboard");
    } else if (role === "COUNSELOR") {
      navigate("/counsellor/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex justify-between items-center bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 shadow-2xl">
      <div className="flex items-center gap-6">
        {/* Back Button (Only if not on dashboard/home) */}
        {!isDashboard && !isAuthPage && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl glass-panel border border-white/10 hover:border-brand-primary/50 transition-all group"
          >
            <ChevronLeft size={20} className="text-white/60 group-hover:text-brand-primary transition-colors" />
          </button>
        )}

        {/* Logo Section */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 group-hover:border-brand-primary/50 transition-all shadow-lg">
            <img src={logo} alt="Unmuted Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tighter text-white group-hover:text-brand-primary transition-colors">UNMUTED</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isAuthenticated && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className={`p-2.5 rounded-xl glass-panel border border-white/10 transition-all hover:scale-105 active:scale-95 group
              ${location.pathname === "/profile" ? "bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/20" : "hover:border-brand-primary/50"}
            `}
            title="Profile"
          >
            <User size={20} className={location.pathname === "/profile" ? "text-white" : "text-white/60 group-hover:text-brand-primary"} />
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl glass-panel border border-white/10 hover:border-red-500/50 transition-all hover:scale-105 active:scale-95 group"
            title="Logout"
          >
            <LogOut size={20} className="text-white/40 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      )}
    </header>
  );
};

export default GlobalNavbar;
