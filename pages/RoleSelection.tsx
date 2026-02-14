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
    <div className="relative min-h-screen w-full bg-[#0a0a0c] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-brand-secondary opacity-[0.05] blur-[150px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-brand-primary opacity-[0.05] blur-[150px] rounded-full animate-pulse-glow" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center reveal">
        <div className="inline-flex items-center gap-2 px-4 py-1 glass-panel border border-white/10 rounded-full mb-10">
          <Sparkles size={12} className="text-brand-primary" />
          <span className="text-[9px] font-luxury uppercase tracking-[0.3em] text-white/60">Professional Entrance</span>
        </div>
        
        <h2 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter text-center">
          Choose your <span className="text-gradient italic">path</span>
        </h2>
        <p className="text-white/30 mb-20 text-xl font-light tracking-widest text-center max-w-2xl uppercase">Select your portal to continue</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-5xl">
          
          {/* Student Card */}
          <div 
            onClick={() => handleSelect("STUDENT")}
            className="group relative cursor-pointer glass-panel p-1 border border-white/5 hover:border-brand-primary/30 transition-all duration-700 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
               <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" alt="Student" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
            </div>
            <div className="relative p-12 flex flex-col justify-between min-h-[400px] bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent">
              <div>
                <div className="w-14 h-14 bg-brand-primary/20 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-brand-primary transition-all duration-500 group-hover:rotate-[10deg]">
                  <GraduationCap size={28} className="text-white" />
                </div>
                <h3 className="text-5xl font-bold text-white mb-6 tracking-tight tracking-tighter">I am a Student</h3>
                <p className="text-white/50 font-light text-xl leading-relaxed max-w-xs uppercase tracking-widest text-sm">Seek professional guidance and meaningful connection.</p>
              </div>
              <div className="flex items-center gap-3 text-brand-primary font-bold text-sm uppercase tracking-widest mt-10 transition-all group-hover:translate-x-4">
                Enter Student Portal <ChevronRight size={18} />
              </div>
            </div>
          </div>

          {/* Counselor Card */}
          <div 
            onClick={() => handleSelect("COUNSELOR")}
            className="group relative cursor-pointer glass-panel p-1 border border-white/5 hover:border-brand-secondary/30 transition-all duration-700 overflow-hidden"
          >
             <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
               <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2070&auto=format&fit=crop" alt="Counselor" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
            </div>
            <div className="relative p-12 flex flex-col justify-between min-h-[400px] bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent">
              <div>
                <div className="w-14 h-14 bg-brand-secondary/20 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-brand-secondary transition-all duration-500 group-hover:rotate-[-10deg]">
                  <HeartHandshake size={28} className="text-white" />
                </div>
                <h3 className="text-5xl font-bold text-white mb-6 tracking-tight tracking-tighter">I am a Counselor</h3>
                <p className="text-white/50 font-light text-xl leading-relaxed max-w-xs uppercase tracking-widest text-sm">Provide expert guidance and support to students.</p>
              </div>
              <div className="flex items-center gap-3 text-brand-secondary font-bold text-sm uppercase tracking-widest mt-10 transition-all group-hover:translate-x-4">
                Enter Counselor Portal <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 text-white/5 font-luxury text-[11px] tracking-[1.5em] uppercase pointer-events-none">
        U N M U T E D
      </div>
    </div>
  );
};

export default RoleSelection;
