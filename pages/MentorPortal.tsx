import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  Calendar, 
  MessageSquare,
  Lock,
  ChevronRight,
  TrendingUp,
  History
} from "lucide-react";

interface CounsellorStats {
  counsellorId: string;
  counsellorName: string;
  totalSessions: number;
  uniqueStudents: Set<string>;
  lastStudentName: string;
  lastProblem: string;
  lastSessionDate: string;
}

const MentorPortal: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CounsellorStats[]>([]);

  const MENTOR_PASSWORD = import.meta.env.VITE_MENTOR_PASSWORD || "Peacee@2025"; // Fallback for your use case if env is missing

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
      // Fetch all VideoCallSessions
      const sessionsSnap = await getDocs(collection(db, "VideoCallSession"));
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
            lastStudentName: "",
            lastProblem: "",
            lastSessionDate: "1970-01-01",
          };
        }

        const current = counsellorsMap[counsellorId];
        current.totalSessions += 1;
        if (studentId) current.uniqueStudents.add(studentId);

        // Track last session (most recent date)
        const currentDate = sessionTs.getTime();
        const storedDate = new Date(current.lastSessionDate).getTime();

        if (currentDate > storedDate) {
          current.lastStudentName = studentName;
          current.lastProblem = problem;
          current.lastSessionDate = sessionTs.toLocaleString();
        }
      });

      setStats(Object.values(counsellorsMap).sort((a, b) => b.totalSessions - a.totalSessions));
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
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

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Users className="text-blue-400" />} label="Total Active Counsellors" value={stats.length.toString()} />
          <StatCard icon={<TrendingUp className="text-green-400" />} label="Platform Reach" value={stats.reduce((acc, curr) => acc + curr.uniqueStudents.size, 0).toString() + " Unique Students"} />
          <StatCard icon={<History className="text-purple-400" />} label="Last Global Sync" value={new Date().toLocaleTimeString()} />
        </div>

        {/* Main Data Table */}
        <div className="glass-panel border-white/5 shadow-2xl overflow-hidden reveal">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
              <Calendar size={20} className="text-blue-400" />
              Counsellor Performance Overview
            </h3>
            <div className="text-[10px] font-luxury tracking-widest text-white/20 uppercase">Real-time Aggregation</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase">Counsellor</th>
                  <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase text-center">Sessions</th>
                  <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase text-center">Students</th>
                  <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase">Latest Engagement</th>
                  <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase">Reported Issue</th>
                  <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-white/20 font-luxury tracking-[0.3em] uppercase animate-pulse">Fetching Secure Records...</td>
                  </tr>
                ) : stats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-white/20">No session records found.</td>
                  </tr>
                ) : (
                  stats.map((s) => (
                    <tr key={s.counsellorId} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 font-bold text-xs uppercase">
                            {s.counsellorName.substring(0, 2)}
                          </div>
                          <span className="font-bold text-white/90">{s.counsellorName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-mono border border-blue-500/20">{s.totalSessions}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-white/60 text-xs font-mono">{s.uniqueStudents.size}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-white/80">{s.lastStudentName}</span>
                          <span className="text-[10px] text-white/20 uppercase tracking-widest">Student</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-xs truncate text-xs text-white/40 italic" title={s.lastProblem}>
                          "{s.lastProblem}"
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-white/60">{s.lastSessionDate.split(',')[0]}</span>
                          <span className="text-[10px] text-white/20 uppercase tracking-widest">{s.lastSessionDate.split(',')[1]}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="glass-panel p-8 border-white/5 flex items-center gap-6">
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-luxury tracking-widest text-white/30 uppercase mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
);

export default MentorPortal;
