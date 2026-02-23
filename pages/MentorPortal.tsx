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
  Clock,
  LayoutGrid,
  CalendarDays
} from "lucide-react";

interface SessionRecord {
  sessionId: string;
  studentName: string;
  problem: string;
  date: Date;
  dateStr: string;
  isFuture: boolean;
}

interface AvailableSlot {
  date: string;
  time: string;
}

interface UnpaidRecord {
  studentEmail: string;
  studentName: string;
  counsellorName: string;
  dateStr: string;
  status: string;
}

interface CounsellorStats {
  counsellorId: string;
  counsellorName: string;
  totalSessions: number;
  uniqueStudents: Set<string>;
  weeklyAvailableSlots: number;
  availableSlotDetails: AvailableSlot[];
  sessions: SessionRecord[];
}

const MentorPortal: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CounsellorStats[]>([]);
  const [unpaidSessions, setUnpaidSessions] = useState<UnpaidRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'counsellors' | 'unpaid'>('counsellors');
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

  const downloadStudentReport = async () => {
    setLoading(true);
    try {
      // 1. Fetch ALL users
      const usersSnap = await getDocs(collection(db, "Users"));
      
      // 2. Fetch ALL paid/completed sessions to check status
      const paidSessionsSnap = await getDocs(query(
        collection(db, "VideoCallSession"),
        where("status", "in", ["paid", "live", "completed"])
      ));

      // 3. Create a set of student UIDs who have paid
      const paidStudentUids = new Set();
      paidSessionsSnap.forEach(doc => {
        const data = doc.data();
        const uid = data.student?.uid || data.studentId;
        if (uid) paidStudentUids.add(uid);
      });

      // 4. Build CSV data
      let csvContent = "Email,Name,Status\n";
      
      usersSnap.forEach(doc => {
        const user = doc.data();
        // Only include students
        const rawRole = (user.role || "").toUpperCase();
        if (rawRole === 'STUDENT' || !rawRole) {
          const email = user.email || "N/A";
          const name = user.username || user.email?.split('@')[0] || "Unknown";
          const status = paidStudentUids.has(doc.id) ? "Paid" : "Not Paid";
          
          // Escape commas for CSV safety
          csvContent += `"${email}","${name}","${status}"\n`;
        }
      });

      // 5. Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `unmuted_student_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const counsellorsMap: Record<string, CounsellorStats> = {};
      const unpaid: UnpaidRecord[] = [];

      // 1. Fetch ALL registered counsellors first
      const counsellorsSnap = await getDocs(collection(db, "Counsellors"));
      counsellorsSnap.forEach(doc => {
        const data = doc.data();
        const cid = doc.id;
        const name = data.username || data.initials || "Anonymous";
        counsellorsMap[cid] = createEmptyStats(cid, name);
      });

      // 2. Fetch ALL sessions to separate paid and unpaid
      const sessionsSnap = await getDocs(collection(db, "VideoCallSession"));

      // 3. Fetch ALL global slots to count weekly availability
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);
      const weekFromNowStr = weekFromNow.toISOString().split('T')[0];
      const todayStr = now.toISOString().split('T')[0];

      const qSlots = query(
        collection(db, "GlobalSessions"),
        where("date", ">=", todayStr),
        where("date", "<=", weekFromNowStr)
      );
      const slotsSnap = await getDocs(qSlots);

      // Process Weekly Slots
      slotsSnap.forEach(doc => {
        const data = doc.data();
        const cid = data.counsellorId;
        if (!cid) return;

        if (!counsellorsMap[cid]) {
          counsellorsMap[cid] = createEmptyStats(cid, data.counsellorUsername || data.counsellorInitials || "Anonymous");
        }
        
        // Only count unbooked slots for availability
        if (!data.isBooked) {
          counsellorsMap[cid].weeklyAvailableSlots += 1;
          counsellorsMap[cid].availableSlotDetails.push({
            date: data.date,
            time: data.time
          });
        }
      });

      // Process Session Data
      sessionsSnap.forEach((doc) => {
        const data = doc.data();
        const cid = data.counsellorId || data.selectedSlot?.counsellorId;
        const studentEmail = data.student?.email || "N/A";
        const studentName = data.student?.username || "Unknown";
        const counsellorName = data.selectedSlot?.counsellorUsername || data.selectedSlot?.counsellorInitials || "Anonymous";
        const status = data.status;
        const sessionTs = data.sessionTimestamp?.toDate() || data.createdAt?.toDate() || new Date(0);

        // If unpaid/abandoned
        if (!["paid", "live", "completed"].includes(status)) {
          unpaid.push({
            studentEmail,
            studentName,
            counsellorName,
            dateStr: sessionTs.toLocaleString(),
            status: status || "unknown"
          });
          return;
        }

        if (!cid) return;

        if (!counsellorsMap[cid]) {
          counsellorsMap[cid] = createEmptyStats(cid, data.selectedSlot?.counsellorUsername || "Anonymous");
        }

        const current = counsellorsMap[cid];
        current.totalSessions += 1;
        const studentId = data.student?.uid || data.studentId;
        if (studentId) current.uniqueStudents.add(studentId);

        current.sessions.push({
          sessionId: doc.id,
          studentName,
          problem,
          date: sessionTs,
          dateStr: sessionTs.toLocaleString(),
          isFuture: sessionTs > now
        });
      });

      // Final processing: Sort everything
      const result = Object.values(counsellorsMap).map(c => {
        c.sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
        // Sort available slots by date then time
        c.availableSlotDetails.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.time.localeCompare(b.time);
        });
        return c;
      });

      setUnpaidSessions(unpaid.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()));
      setStats(result.sort((a, b) => b.totalSessions - a.totalSessions));
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const createEmptyStats = (id: string, name: string): CounsellorStats => ({
    counsellorId: id,
    counsellorName: name,
    totalSessions: 0,
    uniqueStudents: new Set(),
    weeklyAvailableSlots: 0,
    availableSlotDetails: [],
    sessions: [],
  });

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
        
        <div className="flex items-center gap-4">
          <button 
            onClick={downloadStudentReport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-500/10 border border-green-500/20 rounded-full hover:bg-green-500/20 transition-all text-[10px] font-luxury tracking-widest uppercase text-green-400"
          >
            {loading ? <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" /> : <><TrendingUp size={14} /> Download Report</>}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-[10px] font-luxury tracking-widest uppercase text-white/60 hover:text-white"
          >
            <LogOut size={14} /> Exit Portal
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<Users className="text-blue-400" />} label="Active Counsellors" value={stats.length.toString()} />
          <StatCard icon={<LayoutGrid className="text-green-400" />} label="Total Free Slots" value={stats.reduce((acc, curr) => acc + curr.weeklyAvailableSlots, 0).toString()} />
          <StatCard icon={<History className="text-purple-400" />} label="Last Sync" value={new Date().toLocaleTimeString()} />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('counsellors')}
            className={`px-8 py-3 rounded-2xl font-luxury text-[10px] tracking-[0.2em] uppercase transition-all border
              ${activeTab === 'counsellors' ? 'bg-blue-500/20 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}
            `}
          >
            Counsellor Performance
          </button>
          <button 
            onClick={() => setActiveTab('unpaid')}
            className={`px-8 py-3 rounded-2xl font-luxury text-[10px] tracking-[0.2em] uppercase transition-all border
              ${activeTab === 'unpaid' ? 'bg-red-500/20 border-red-500/50 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}
            `}
          >
            Unpaid / Abandoned Bookings
          </button>
        </div>

        {activeTab === 'counsellors' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-sm font-luxury tracking-[0.3em] text-white/40 uppercase">Counsellor Records</h3>
              <p className="text-[9px] text-white/20 uppercase tracking-widest font-luxury">Click rows to expand details</p>
            </div>

            {loading ? (
              <div className="glass-panel p-20 flex justify-center border-white/5">
                 <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stats.length === 0 ? (
              <div className="glass-panel p-24 text-center border-dashed border-white/5 opacity-40">
                <p className="font-luxury tracking-widest text-sm uppercase">No verified records found.</p>
              </div>
            ) : (
              stats.map((c) => (
                <div key={c.counsellorId} className="space-y-4">
                  <div 
                    onClick={() => toggleCounsellor(c.counsellorId)}
                    className={`glass-panel p-8 border hover:border-white/20 transition-all cursor-pointer group flex flex-col lg:flex-row justify-between items-center gap-8
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
                        <p className="text-[9px] font-luxury text-white/20 uppercase tracking-widest mb-1">Open Slots</p>
                        <p className="text-xl font-bold text-green-400 font-mono">{c.weeklyAvailableSlots}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-luxury text-white/20 uppercase tracking-widest mb-1">Paid Cases</p>
                        <p className="text-xl font-bold text-blue-400 font-mono">{c.totalSessions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-luxury text-white/20 uppercase tracking-widest mb-1">Unique Users</p>
                        <p className="text-xl font-bold text-white/80 font-mono">{c.uniqueStudents.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {expandedCounsellor === c.counsellorId ? <ChevronUp className="text-white/20" /> : <ChevronDown className="text-white/20" />}
                    </div>
                  </div>

                  {expandedCounsellor === c.counsellorId && (
                    <div className="glass-panel border-white/5 p-10 bg-white/[0.01] animate-in slide-in-from-top-4 duration-500 overflow-hidden space-y-12">
                      {/* Availability Windows */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                          <CalendarDays size={16} className="text-green-400" />
                          <h5 className="text-xs font-luxury tracking-[0.3em] text-white/60 uppercase">Availability Windows (Unbooked)</h5>
                        </div>
                        {c.availableSlotDetails.length === 0 ? (
                          <p className="text-xs text-white/20 italic ml-4">No open slots currently posted for this week.</p>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {c.availableSlotDetails.map((slot, i) => (
                              <div key={i} className="px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center gap-3">
                                <span className="text-[10px] font-bold text-green-400 font-mono">{slot.date}</span>
                                <div className="w-[1px] h-3 bg-white/10" />
                                <span className="text-[10px] text-white/60 uppercase tracking-widest">{slot.time}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Engagement Log */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                          <MessageSquare size={16} className="text-blue-400" />
                          <h5 className="text-xs font-luxury tracking-[0.3em] text-white/60 uppercase">Engagement Log (Paid)</h5>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {c.sessions.map((session) => (
                            <div key={session.sessionId} className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${session.isFuture ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]' : 'bg-blue-500/5 border-blue-500/10'}`}>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${session.isFuture ? 'bg-red-500' : 'bg-blue-400'}`} />
                                  <span className={`text-sm font-bold tracking-tight ${session.isFuture ? 'text-red-400' : 'text-blue-300'}`}>Student: {session.studentName}</span>
                                  {session.isFuture && <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Upcoming</span>}
                                  {!session.isFuture && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-opacity-60">History</span>}
                                </div>
                                <p className={`text-sm font-light leading-relaxed max-w-2xl ${session.isFuture ? 'text-white/70' : 'text-white/50'}`}><span className="opacity-40 italic">Reported Issue: </span>"{session.problem}"</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 opacity-40">
                                <div className="flex items-center gap-2 text-[10px] font-luxury tracking-widest uppercase"><Calendar size={12} /> {session.dateStr.split(',')[0]}</div>
                                <div className="flex items-center gap-2 text-[10px] font-luxury tracking-widest uppercase"><Clock size={12} /> {session.dateStr.split(',')[1]}</div>
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
        ) : (
          <div className="space-y-6 reveal">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-sm font-luxury tracking-[0.3em] text-red-400/60 uppercase">Outreach List</h3>
              <p className="text-[9px] text-white/20 uppercase tracking-widest font-luxury">{unpaidSessions.length} sessions pending payment</p>
            </div>

            <div className="glass-panel border-white/5 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase">Student Email</th>
                    <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase">Student Name</th>
                    <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase">Counsellor</th>
                    <th className="px-8 py-5 text-[10px] font-luxury tracking-widest text-white/40 uppercase text-right">Attempt Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {unpaidSessions.map((u, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6 text-sm text-blue-400 font-mono">{u.studentEmail}</td>
                      <td className="px-8 py-6 text-sm text-white/80">{u.studentName}</td>
                      <td className="px-8 py-6 text-sm text-white/40">{u.counsellorName}</td>
                      <td className="px-8 py-6 text-right text-[10px] text-white/20 uppercase tracking-widest font-luxury">{u.dateStr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
