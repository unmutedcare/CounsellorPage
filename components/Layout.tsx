import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ContactFAB from "./ContactFAB";
import GlobalNavbar from "./GlobalNavbar";

const Layout: React.FC = () => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  const isHome =
    location.pathname === "/" ||
    location.pathname === "/role-select" ||
    location.pathname === "/student/login" ||
    location.pathname === "/counsellor/login" ||
    location.pathname === "/student/signup" ||
    location.pathname === "/verify-email";

  const showNavbar = !isHome || isAuthenticated;

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white overflow-x-hidden relative">
      {/* Omnipresent Navbar */}
      <GlobalNavbar />

      {/* MAIN CONTENT */}
      <main className={`${isHome && !isAuthenticated ? "" : "pt-20"} w-full`}>
        <Outlet />
      </main>

      {/* Global Support FAB */}
      <ContactFAB />
    </div>
  );
};

export default Layout;
