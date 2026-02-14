import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  LogOut, 
  CheckCircle2, 
  Calendar, 
  Wind,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from "lucide-react";
import { auth } from "../../firebase/firebase";
import {
  getCompletedCases,
  CompletedCase,
} from "../../services/completedCasesBackend";

const CompletedCases: React.FC = () => {
  const [cases, setCases] = useState<CompletedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getCompletedCases()
      .then(setCases)
      .catch(() => setError("Failed to load records"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await auth?.signOut();
      navigate("/role-select");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white p-6 pb-24 overflow-x-hidden">
      {/* Background Accents */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-[#ff2d55] opacity-5 blur-[150px] rounded-full" />
      
      <div className="max-w-4xl mx-auto space-y-12 relative z-10 reveal pt-12">
        {/* Title Section */}
        <div className="text-center mb-16">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff2d55]/10 rounded-full mb-6">
              <Sparkles size={14} className="text-[#ff2d55]" />
              <span className="text-[10px] font-luxury tracking-[0.2em] text-[#ff2d55] uppercase">Historical Impact</span>
           </div>
           <h2 className="text-5xl font-bold tracking-tighter mb-4">Past <span className="text-gradient italic">Transformations</span></h2>
           <p className="text-white/40 text-lg font-light tracking-wide max-w-xl mx-auto">
             A record of the moments where raw truth met elite guidance.
           </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-2 border-[#ff2d55] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="glass-panel p-12 border-red-500/20 text-red-500 text-center">
            {error}
          </div>
        ) : cases.length === 0 ? (
          <div className="glass-panel p-24 text-center border-dashed border-white/5 opacity-40">
            <p className="font-luxury tracking-widest text-sm uppercase">The archives are currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {cases.map((c) => (
              <div
                key={c.sessionId}
                className="glass-panel p-10 border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-5 transition-opacity translate-x-4">
                   <BookOpen size={160} />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[9px] font-luxury tracking-[0.3em] text-[#ff2d55] uppercase">Completed Revelation</p>
                        <h3 className="text-3xl font-bold tracking-tight">Student: {c.studentName}</h3>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-1 bg-[#4caf50]/10 border border-[#4caf50]/20 rounded-full">
                         <CheckCircle2 size={12} className="text-[#4caf50]" />
                         <span className="text-[9px] font-luxury tracking-widest text-[#4caf50] uppercase">Verified</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 text-white/30 font-light text-sm">
                       <div className="flex items-center gap-2"><Calendar size={14}/> {c.date}</div>
                       <div className="flex items-center gap-2 font-luxury text-[10px] tracking-widest">ID: #{c.sessionId.slice(-6)}</div>
                    </div>

                    {c.description && (
                      <div className="relative p-6 bg-white/[0.02] rounded-3xl border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                        <span className="absolute top-4 left-4 text-2xl text-[#ff2d55] font-serif italic opacity-20">"</span>
                        <p className="text-white/60 font-light leading-relaxed italic px-4">
                          {c.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col justify-end gap-4">
                     <button className="p-4 rounded-2xl glass-panel border-white/5 hover:border-[#ff2d55]/30 transition-all text-white/20 hover:text-[#ff2d55]">
                        <ChevronRight size={24} />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-12 text-white/5 font-luxury text-[10px] tracking-[1.5em] uppercase left-1/2 -translate-x-1/2 pointer-events-none">
        A R C H I V E S • G U I D E
      </div>
    </div>
  );
};

export default CompletedCases;
