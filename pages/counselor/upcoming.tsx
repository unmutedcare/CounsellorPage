import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  LogOut, 
  Video, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Wind
} from "lucide-react";
import { auth } from "../../firebase/firebase";
import {
  fetchUpcomingCases,
  markSessionCompleted,
} from "../../services/counsellorUpcomingCasesService.ts";

const UpcomingCases: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchUpcomingCases();
      setCases(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleLogout = async () => {
    try {
      await auth?.signOut();
      navigate("/role-select");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    if (!window.confirm("Mark this transformation as complete?")) return;
    await markSessionCompleted(id);
    setCases((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white p-6 pb-24 overflow-x-hidden">
      {/* Background Accents */}
      <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-[#5856d6] opacity-5 blur-[150px] rounded-full" />
      
      <div className="max-w-4xl mx-auto space-y-12 relative z-10 reveal pt-12">
        {/* Title Section */}
        <div className="text-center mb-16">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#5856d6]/10 rounded-full mb-6">
              <Sparkles size={14} className="text-[#5856d6]" />
              <span className="text-[10px] font-luxury tracking-[0.2em] text-[#5856d6] uppercase">Portal Readiness</span>
           </div>
           <h2 className="text-5xl font-bold tracking-tighter mb-4">Upcoming <span className="text-gradient italic">Sessions</span></h2>
           <p className="text-white/40 text-lg font-light tracking-wide max-w-xl mx-auto">
             These students have scheduled sessions with you. Prepare your space for professional support.
           </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-2 border-[#5856d6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cases.length === 0 ? (
          <div className="glass-panel p-24 text-center border-dashed border-white/5 opacity-40">
            <p className="font-luxury tracking-widest text-sm uppercase">No upcoming sessions at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {cases.map((c) => (
              <div
                key={c.id}
                className="glass-panel p-10 border border-white/5 hover:border-[#5856d6]/30 transition-all group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity translate-x-4">
                   <Video size={160} />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                       <span className="w-1.5 h-1.5 rounded-full bg-[#5856d6] animate-pulse" />
                       <span className="text-[9px] font-luxury tracking-widest text-white/60 uppercase">{c.status}</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight">Student: {c.student}</h3>
                      <div className="flex items-center gap-6 mt-2 text-white/40 font-light">
                         <div className="flex items-center gap-2 font-luxury text-[10px] tracking-widest uppercase"><Calendar size={14} className="text-[#5856d6]"/> {c.date}</div>
                         <div className="flex items-center gap-2 font-luxury text-[10px] tracking-widest uppercase"><Clock size={14} className="text-[#5856d6]"/> {c.time}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                    <button
                      onClick={() => window.open(c.meetingLink, "_blank")}
                      className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#4caf50] text-white font-bold transition-all hover:scale-105 shadow-lg shadow-[#4caf50]/20"
                    >
                      <Video size={20} />
                      Join Portal
                    </button>

                    <button
                      onClick={() => handleMarkCompleted(c.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
                    >
                      <CheckCircle2 size={20} />
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-12 text-white/5 font-luxury text-[10px] tracking-[1.5em] uppercase left-1/2 -translate-x-1/2 pointer-events-none">
        G U I D E • V I G I L A N C E
      </div>
    </div>
  );
};

export default UpcomingCases;
