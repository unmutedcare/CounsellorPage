import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCounsellorSessions } from "../../services/counsellorSessionService";
import { auth } from "../../firebase/firebase";
import { 
  User, 
  LogOut, 
  Calendar, 
  Clock, 
  ClipboardList, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Wind
} from "lucide-react";

const CounselorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCounsellorSessions();
      setSessions(data);
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

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white p-6 pb-24 overflow-x-hidden">
      {/* Background Accents */}
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-[#5856d6] opacity-5 blur-[120px] rounded-full" />
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-10 reveal pt-8">
        
        {/* ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionCard 
            icon={<Calendar size={24} />}
            title="Set Availability"
            desc="Design your availability. Add up to 3 counseling sessions per day."
            color="#4caf50"
            onClick={() => navigate("/counsellor/set-timing")}
          />
          <ActionCard 
            icon={<ClipboardList size={24} />}
            title="Upcoming Cases"
            desc="Prepare for transformation. Manage your scheduled sessions."
            color="#5856d6"
            onClick={() => navigate("/counsellor/upcoming-cases")}
          />
          <ActionCard 
            icon={<CheckCircle2 size={24} />}
            title="Session Records"
            desc="Reflect on history. Review past sessions and student progress."
            color="#ff2d55"
            onClick={() => navigate("/counsellor/completed-cases")}
          />
        </div>

        {/* SESSIONS LIST */}
        <div className="space-y-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Sparkles size={20} className="text-[#5856d6]" />
               <h2 className="text-2xl font-bold tracking-tighter">My Sessions</h2>
            </div>
            <span className="text-[10px] font-luxury tracking-[0.2em] opacity-30 uppercase">{sessions.length} TOTAL SESSIONS</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
               <div className="w-12 h-12 border-2 border-[#5856d6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="glass-panel p-20 text-center border-dashed border-white/5 opacity-40">
               <p className="font-luxury tracking-widest text-sm uppercase">No active sessions in your schedule.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((s) => (
                <div key={s.id} className="glass-panel p-8 border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
                  <div className="space-y-2">
                    <p className="text-[10px] font-luxury tracking-[0.2em] text-[#5856d6] uppercase">Active Engagement</p>
                    <h4 className="text-xl font-bold tracking-tight">Student: {s.student?.username || s.studentId.slice(0, 8) + "..."}</h4>
                    <div className="flex items-center gap-4 text-white/40 text-sm font-light">
                       <div className="flex items-center gap-1.5"><Calendar size={14}/> {s.date}</div>
                       <div className="flex items-center gap-1.5"><Clock size={14}/> {s.time}</div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                    <span className="px-4 py-1 bg-white/5 rounded-full text-[9px] font-luxury tracking-widest uppercase border border-white/10 group-hover:border-[#5856d6]/30 transition-colors">
                      {s.status}
                    </span>
                    
                    {(s.status === 'paid' || s.status === 'live') && (
                      <button 
                        onClick={() => window.open(s.meetingLink, "_blank")}
                        className="flex items-center gap-2 px-6 py-2 bg-[#4caf50] text-white rounded-xl text-[10px] font-luxury tracking-widest uppercase hover:scale-105 transition-all shadow-lg shadow-[#4caf50]/20"
                      >
                        Join Portal
                      </button>
                    )}

                    <button 
                      onClick={() => navigate("/counsellor/upcoming-cases")}
                      className="text-[#5856d6] opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 hidden md:block"
                    >
                       <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-12 text-white/5 font-luxury text-[10px] tracking-[1.5em] uppercase left-1/2 -translate-x-1/2 pointer-events-none">
        G U I D E • O P E R A T I O N S
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, desc, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className="group cursor-pointer glass-panel p-10 border-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 translate-y-[-4px]">
       {React.cloneElement(icon, { size: 120 })}
    </div>
    <div className="relative z-10 space-y-6">
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color: color, border: `1px solid ${color}20` }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-bold tracking-tight mb-2">{title}</h3>
        <p className="text-white/40 font-light text-sm leading-relaxed">{desc}</p>
      </div>
      <div className="pt-4 flex items-center gap-2 text-xs font-luxury tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" style={{ color }}>
        OPEN PORTAL <ChevronRight size={14} />
      </div>
    </div>
  </div>
);

export default CounselorDashboard;
