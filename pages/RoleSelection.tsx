import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { GraduationCap, HeartHandshake, ChevronRight, Sparkles } from "lucide-react";

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const handleSelect = (role: "STUDENT" | "COUNSELOR") => {
    setRole(role);
    if (role === "STUDENT") {
      navigate("/student/login");
    } else {
      navigate("/counsellor/login");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 flex flex-col items-center justify-center p-6 overflow-hidden text-white">
      
      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center reveal">
        
        <h2 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter text-center">
          Choose your <span className="italic drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">path</span>
        </h2>
        <p className="text-white/40 mb-20 text-xl font-light tracking-widest text-center max-w-2xl uppercase font-luxury">Select your portal to continue</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-5xl">
          
          {/* Student Card */}
          <div 
            onClick={() => handleSelect("STUDENT")}
            className="group relative cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-700 rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <div className="relative p-12 flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="text-5xl font-bold text-white mb-6 tracking-tighter">I am a Student</h3>
                <p className="text-white/60 font-light text-xl leading-relaxed max-w-xs uppercase tracking-widest text-sm font-luxury">Talk to a peer counsellor or someone who actually understands you.</p>
              </div>
              <div className="flex items-center gap-3 text-white font-bold text-sm uppercase tracking-widest mt-10 transition-all group-hover:translate-x-4 font-luxury">
                Enter Student Portal <ChevronRight size={18} />
              </div>
            </div>
          </div>

          {/* Counselor Card */}
          <div 
            onClick={() => handleSelect("COUNSELOR")}
            className="group relative cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-700 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-sm"
          >
            <div className="relative p-12 flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="text-5xl font-bold text-white mb-6 tracking-tighter">I am a Counsellor</h3>
                <p className="text-white/40 font-light text-xl leading-relaxed max-w-xs uppercase tracking-widest text-sm font-luxury">(only for company registered peer counsellors)</p>
              </div>
              <div className="flex items-center gap-3 text-white font-bold text-sm uppercase tracking-widest mt-10 transition-all group-hover:translate-x-4 font-luxury">
                Enter Counsellor Portal <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
