import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  Wind, 
  ChevronRight, 
  History, 
  CalendarCheck, 
  ChevronLeft,
  Edit3,
  Save,
  CheckCircle2,
  Mail,
  Shield
} from "lucide-react";
import { fetchMyBookings } from "../services/studentBookingService";
import { refreshSessionStatus } from "../services/sessionStatusService";
import { getUserProfile, updateUserProfile } from "../services/userService";

const Profile: React.FC = () => {
  const { role, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "details">("upcoming");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [initials, setInitials] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Refresh status + Load sessions + profile
  useEffect(() => {
    const load = async () => {
      await refreshSessionStatus();
      const [bookings, profileData] = await Promise.all([
        fetchMyBookings(),
        getUserProfile()
      ]);
      setSessions(bookings);
      setProfile(profileData);
      if (profileData) {
        setUsername(profileData.username || "");
        setInitials(profileData.initials || "");
        setMeetingLink(profileData.meetingLink || "");
      }
      setLoading(false);
    };
    load();
  }, []);

  // Parse query param for tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "completed") setActiveTab("completed");
    else if (tab === "details") setActiveTab("details");
    else setActiveTab("upcoming");
  }, [location.search]);

  const filteredSessions = sessions.filter(
    s => s.status === activeTab
  );

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ 
        username,
        ...(role === 'COUNSELOR' ? { initials, meetingLink } : {})
      });
      setSuccess(true);
      setProfile({ ...profile, username, initials, meetingLink });
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white p-6 overflow-x-hidden">
      {/* Background Accents */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary opacity-[0.03] blur-[150px] rounded-full animate-pulse-glow" />
      
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col pt-12 reveal">
        
        {/* Identity Overview */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="w-24 h-24 rounded-[2.5rem] accent-gradient p-[1px]">
             <div className="w-full h-full bg-[#0a0a0c] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group">
                <User size={40} className="text-white relative z-10" />
             </div>
          </div>
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
               <Sparkles size={12} className="text-brand-primary" />
               <span className="text-[10px] font-luxury tracking-widest text-white/60 uppercase">{role} Identity</span>
            </div>
            <h2 className="text-5xl font-bold tracking-tighter">My <span className="text-gradient italic">Profile</span></h2>
            <p className="text-white/30 font-light tracking-wide italic">Your history of support and transformation.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1.5 bg-white/5 rounded-3xl border border-white/10 mb-12 max-w-2xl mx-auto w-full overflow-x-auto no-scrollbar shadow-xl">
          <TabButton 
            active={activeTab === "upcoming"} 
            onClick={() => setActiveTab("upcoming")}
            icon={<CalendarCheck size={16} />}
            label="Upcoming Sessions"
          />
          <TabButton 
            active={activeTab === "completed"} 
            onClick={() => setActiveTab("completed")}
            icon={<History size={16} />}
            label="History"
          />
          <TabButton 
            active={activeTab === "details"} 
            onClick={() => setActiveTab("details")}
            icon={<User size={16} />}
            label="Account Details"
          />
        </div>

        {/* Content Area */}
        <div className="space-y-6 pb-20">
          {loading ? (
            <div className="flex justify-center py-20">
               <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === "details" ? (
            <div className="reveal">
              <div className="glass-panel p-10 border-white/5 relative overflow-hidden">
                <div className="space-y-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold tracking-tight">Identity Management</h3>
                    <button 
                      onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full font-luxury text-[10px] tracking-[0.2em] uppercase transition-all
                        ${isEditing ? 'bg-brand-primary text-white shadow-lg' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}
                    >
                      {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isEditing ? <><Save size={14}/> Save Changes</> : <><Edit3 size={14}/> Edit Profile</>}
                    </button>
                  </div>

                  {success && (
                    <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 size={18} className="text-brand-primary" />
                      <p className="text-sm text-brand-primary">Profile details updated successfully.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-luxury tracking-[0.3em] text-white/30 uppercase ml-1 block">Account Username</label>
                      <input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Your display name"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-brand-primary/50 outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-luxury tracking-[0.3em] text-white/30 uppercase ml-1 block">Registered Email</label>
                      <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl p-4 text-white/40 flex items-center gap-3">
                        <Mail size={16} />
                        <span className="truncate">{profile?.email}</span>
                      </div>
                    </div>

                    {role === 'COUNSELOR' && (
                      <>
                        <div className="space-y-3">
                          <label className="text-[10px] font-luxury tracking-[0.3em] text-white/30 uppercase ml-1 block">Sign (Initials)</label>
                          <input 
                            value={initials}
                            onChange={(e) => setInitials(e.target.value.toUpperCase())}
                            disabled={!isEditing}
                            placeholder="e.g. JD"
                            maxLength={3}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white focus:border-brand-primary/50 outline-none transition-all disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-luxury tracking-[0.3em] text-red-500 uppercase ml-1 block font-bold">Google Meet Link (Required)</label>
                          <input 
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://meet.google.com/..."
                            className={`w-full bg-white/[0.03] border rounded-2xl p-4 text-white outline-none transition-all
                              ${isEditing ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/10 opacity-50'}
                            `}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-8 border-t border-white/5 flex items-center gap-4 opacity-20">
                    <Shield size={16} />
                    <p className="text-[9px] font-luxury tracking-[0.2em] uppercase leading-relaxed">
                      All personal information is protected under Unmuted privacy protocols.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="glass-panel p-24 text-center border-dashed border-white/5 opacity-30 flex flex-col items-center gap-6">
               <Wind size={48} className="opacity-20" />
               <p className="font-luxury tracking-widest text-sm uppercase">No {activeTab} sessions found in your history.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredSessions.map(session => (
                <div
                  key={session.id}
                  className="glass-panel p-8 border border-white/5 hover:border-brand-primary/30 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-5 transition-opacity translate-x-4">
                     <Wind size={120} />
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                         <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeTab === 'upcoming' ? 'bg-brand-secondary' : 'bg-brand-primary'}`} />
                         <span className="text-[9px] font-luxury tracking-widest text-white/60 uppercase">{session.status}</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold tracking-tight">Counselor: {session.counsellorName}</h3>
                        <div className="flex items-center gap-6 mt-2 text-white/40 font-light">
                           <div className="flex items-center gap-2 font-luxury text-[10px] tracking-widest uppercase"><Calendar size={14} className="text-brand-primary"/> {session.date}</div>
                           <div className="flex items-center gap-2 font-luxury text-[10px] tracking-widest uppercase"><Clock size={14} className="text-brand-primary"/> {session.time}</div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => activeTab === 'upcoming' && navigate(`/student/countdown?sessionId=${session.id}`)}
                      className="p-4 rounded-2xl glass-panel border-white/5 hover:border-brand-primary/30 transition-all text-white/20 hover:text-brand-primary"
                    >
                       <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/5 font-luxury text-[10px] tracking-[1.5em] uppercase pointer-events-none whitespace-nowrap">
        P E R S O N A L • S U P P O R T
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-luxury tracking-widest uppercase rounded-2xl transition-all duration-500 whitespace-nowrap px-6
      ${active
        ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-[1.02]"
        : "text-white/40 hover:text-white/60"
      }`}
  >
    {icon}
    {label}
  </button>
);

export default Profile;
