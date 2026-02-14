import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  LogOut, 
  Wind,
  Sparkles
} from "lucide-react";
import { auth } from "../firebase/firebase";

const CounselorTopBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth?.signOut();
      navigate("/role-select");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <header className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => navigate("/counsellor/dashboard")}>
         <div className="w-10 h-10 accent-gradient rounded-xl flex items-center justify-center shadow-lg shadow-[#ff2d55]/20">
           <Wind size={20} className="text-white" />
         </div>
         <div className="hidden sm:block">
           <span className="font-luxury tracking-[0.3em] text-[8px] block opacity-40 uppercase">Professional Counselor</span>
           <span className="text-sm font-bold tracking-tighter text-white">UNMUTED</span>
         </div>
      </div>

      <div className="flex gap-3 pointer-events-auto">
        <button
          className="p-3 rounded-2xl glass-panel border border-white/10 hover:border-[#ff2d55]/50 transition-all group"
          onClick={() => navigate("/counsellor/profile")}
        >
          <User size={20} className="text-white group-hover:text-[#ff2d55] transition-colors" />
        </button>
        <button
          className="p-3 rounded-2xl glass-panel border border-white/10 hover:border-red-500/50 transition-all group"
          onClick={handleLogout}
        >
          <LogOut size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default CounselorTopBar;
