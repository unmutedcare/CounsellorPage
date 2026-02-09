import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { User, ChevronLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

const Layout: React.FC = () => {
  const { isAuthenticated } = useApp(); // ❌ no logout here
  const navigate = useNavigate();
  const location = useLocation();

  const backgroundClass =
    "bg-gradient-to-b from-green-400 via-yellow-100 to-orange-300";

  const isHome =
    location.pathname === "/" ||
    location.pathname === "/role-select" ||
    location.pathname === "/auth";

  return (
    <div className={`min-h-screen w-full ${backgroundClass} overflow-x-hidden`}>
      {!isHome && (
        <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-transparent">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/40 hover:bg-white/60 transition"
          >
            <ChevronLeft />
          </button>

          {/* PROFILE ICON ONLY */}
          {isAuthenticated && (
            <button
              onClick={() => navigate("/profile")}
              className="p-2 rounded-full bg-white/40"
            >
              <User />
            </button>
          )}
        </header>
      )}

      {/* MAIN CONTENT */}
      <main className="pt-20 px-6 pb-10 max-w-md mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
