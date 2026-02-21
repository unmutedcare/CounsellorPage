import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  query, 
  where
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  Calendar, 
  MessageSquare,
  Lock,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  History,
  CheckCircle2,
  Clock
} from "lucide-react";

interface SessionRecord {
  sessionId: string;
  studentName: string;
  problem: string;
  date: Date;
  dateStr: string;
}

interface CounsellorStats {
  counsellorId: string;
  counsellorName: string;
  totalSessions: number;
  uniqueStudents: Set<string>;
  sessions: SessionRecord[];
}

const MentorPortal: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CounsellorStats[]>([]);
  const [expandedCounsellor, setExpandedCounsellor] = useState<string | null>(null);

  const MENTOR_PASSWORD = import.meta.env.VITE_MENTOR_PASSWORD || "Peacee@2025";

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem("mentor_auth");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MENTOR_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("mentor_auth", "true");
      fetchStats();
    } else {
      setError("Unauthorized");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("mentor_auth");
    navigate("/");
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch only PAID or COMPLETED sessions
      const q = query(
        collection(db, "VideoCallSession"),
        where("status", "in", ["paid", "live", "completed"])
      );
      
      const sessionsSnap = await getDocs(q);
      const counsellorsMap: Record<string, CounsellorStats> = {};

      sessionsSnap.forEach((doc) => {
        const data = doc.data();
        const counsellorId = data.counsellorId || data.selectedSlot?.counsellorId;
        const counsellorName = data.selectedSlot?.counsellorUsername || data.selectedSlot?.counsellorInitials || "Anonymous";
        const studentId = data.student?.uid || data.studentId;
        const studentName = data.student?.username || "Unknown";
        const problem = data.description || (data.emotions ? data.emotions.join(", ") : "N/A");
        const sessionTs = data.sessionTimestamp?.toDate() || data.createdAt?.toDate() || new Date(0);

        if (!counsellorId) return;

        if (!counsellorsMap[counsellorId]) {
          counsellorsMap[counsellorId] = {
            counsellorId,
            counsellorName,
            totalSessions: 0,
            uniqueStudents: new Set(),
            sessions: [],
          };
        }

        const current = counsellorsMap[counsellorId];
        current.totalSessions += 1;
        if (studentId) current.uniqueStudents.add(studentId);

        current.sessions.push({
          sessionId: doc.id,
          studentName,
          problem,
          date: sessionTs,
          dateStr: sessionTs.toLocaleString(),
        });
      });

      // Sort sessions for each counsellor by date descending (newest first)
      const result = Object.values(counsellorsMap).map(c => {
        c.sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
        return c;
      });

      setStats(result.sort((a, b) => b.totalSessions - a.totalSessions));
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCounsellor = (id: string) => {
    setExpandedCounsellor(expandedCounsellor === id ? null : id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20">
        <div className="w-full max-w-md reveal">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-6">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-[10px] font-luxury tracking-widest text-white/60 uppercase">Admin Access</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">Mentor Portal</h1>
            <p className="text-white/40 font-light">Verification required to proceed.</p>
          </div>

          <form onSubmit={handleLogin} className="glass-panel p-10 border-white/5 shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Secure Passkey</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500/50 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              Verify Credentials
            </button>

            {error && (
              <p className="text-center text-red-400 text-xs font-luxury tracking-widest uppercase animate-pulse">{error}</p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white p-6 md:p-12 overflow-x-hidden">
      {/* Navbar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <ShieldCheck className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tighter">Mentor Oversight</h2>
            <p className="text-[10px] font-luxury tracking-widest text-white/30 uppercase leading-none mt-1">Read-Only Surveillance</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-[10px] font-luxury tracking-widest uppercase text-white/60 hover:text-white"
        >
          <LogOut size={14} /> Exit Portal
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<Users className="text-blue-400" />} label="Active Counsellors" value={stats.length.toString()} />
          <StatCard icon={<TrendingUp className="text-green-400" />} label="Total Paid Bookings" value={stats.reduce((acc, curr) => acc + curr.totalSessions, 0).toString()} />
          <StatCard icon={<History className="text-purple-400" />} label="Last Sync" value={new Date().toLocaleTimeString()} />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-sm font-luxury tracking-[0.3em] text-white/40 uppercase">Counsellor Records</h3>
            <p className="text-[9px] text-white/20 uppercase tracking-widest font-luxury">Click a row to view student cases</p>
          </div>

          {loading ? (
            <div className="glass-panel p-20 flex justify-center border-white/5">
               <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : stats.length === 0 ? (
            <div className="glass-panel p-24 text-center border-dashed border-white/5 opacity-40">
              <p className="font-luxury tracking-widest text-sm uppercase">No verified paid sessions found.</p>
            </div>
          ) : (
            stats.map((c) => (
              <div key={c.counsellorId} className="space-y-4">
                {/* Counsellor Summary Row */}
                <div 
                  onClick={() => toggleCounsellor(c.counsellorId)}
                  className={`glass-panel p-8 border hover:border-white/20 transition-all cursor-pointer group flex flex-col md:flex-row justify-between items-center gap-8
                    ${expandedCounsellor === c.counsellorId ? 'border-white/20 bg-white/[0.05]' : 'border-white/5'}
                  `}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 font-bold text-xl uppercase">
                      {c.counsellorName.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold tracking-tight">{c.counsellorName}</h4>
                      <p className="text-[10px] font-luxury tracking-widest text-white/30 uppercase mt-1">Lead Peer Counsellor</p>
                    </div>
                  </div>

                  <div className="flex gap-12">
                    <div className="text-center">
                      <p className="text-[9px] font-luxury text-white/20 uppercase tracking-widest mb-1">Total Sessions</p>
                      <p className="text-xl font-bold text-blue-400 font-mono">{c.totalSessions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-luxury text-white/20 uppercase tracking-widest mb-1">Unique Students</p>
                      <p className="text-xl font-bold text-white/80 font-mono">{c.uniqueStudents.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {expandedCounsellor === c.counsellorId ? <ChevronUp className="text-white/20" /> : <ChevronDown className="text-white/20" />}
                  </div>
                </div>

                {/* Expanded Cases Dropdown */}
                {expandedCounsellor === c.counsellorId && (
                  <div className="glass-panel border-white/5 p-8 bg-white/[0.01] animate-in slide-in-from-top-4 duration-500 overflow-hidden">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <MessageSquare size={16} className="text-blue-400" />
                        <h5 className="text-xs font-luxury tracking-[0.3em] text-white/60 uppercase">Detailed Case History</h5>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {c.sessions.map((session, index) => (
                          <div 
                            key={session.sessionId}
                            className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6
                              ${index === 0 
                                ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]' 
                                : 'bg-blue-500/5 border-blue-500/10'}
                            `}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${index === 0 ? 'bg-red-500' : 'bg-blue-400'}`} />
                                <span className={`text-sm font-bold tracking-tight ${index === 0 ? 'text-red-400' : 'text-blue-300'}`}>
                                  Student: {session.studentName}
                                </span>
                                {index === 0 && <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Most Recent</span>}
                              </div>
                              <p className={`text-sm font-light leading-relaxed max-w-2xl ${index === 0 ? 'text-white/70' : 'text-white/50'}`}>
                                <span className="opacity-40 italic">Reported Issue: </span>
                                "{session.problem}"
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1 opacity-40">
                              <div className="flex items-center gap-2 text-[10px] font-luxury tracking-widest uppercase">
                                <Calendar size={12} /> {session.dateStr.split(',')[0]}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-luxury tracking-widest uppercase">
                                <Clock size={12} /> {session.dateStr.split(',')[1]}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="glass-panel p-8 border-white/5 flex items-center gap-6">
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-luxury tracking-widest text-white/30 uppercase mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
);

export default MentorPortal;
