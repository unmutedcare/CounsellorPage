import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Edit3, 
  Save, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ChevronLeft,
  Wind
} from "lucide-react";
import { CounsellorProfileBackend } from "../../services/CouncellorProfileBackend";
import { auth } from "../../firebase/firebase";

interface CounsellorProfilePageProps {
  forceEdit?: boolean;
}

const CounsellorProfilePage: React.FC<CounsellorProfilePageProps> = ({
  forceEdit = false,
}) => {
  const navigate = useNavigate();
  const backend = new CounsellorProfileBackend();

  const [isEditing, setIsEditing] = useState<boolean>(forceEdit);
  const [initials, setInitials] = useState("");
  const [username, setUsername] = useState(""); // Add username state
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const initialsRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await backend.getProfile();
      if (profile) {
        setInitials(profile.initials ?? "");
        setMeetingLink(profile.meetingLink ?? "");
        setUsername(profile.username ?? ""); // Load username
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (isEditing && initialsRef.current) {
      initialsRef.current.focus();
    }
  }, [isEditing]);

  const toggleEdit = async () => {
    if (isEditing) {
      setSaving(true);
      const err = await backend.updateProfile({
        initials: initials.trim(),
        meetingLink: meetingLink.trim(),
        username: username.trim(), // Pass username to backend
      });

      setSaving(false);
      if (err) {
        alert(err);
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setIsEditing((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await auth?.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white p-6 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-[#5856d6] opacity-[0.03] blur-[150px] rounded-full animate-pulse-glow" />
      
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col justify-center reveal pt-12">
        {/* Profile Card */}
        <div className="glass-panel p-12 border-white/5 shadow-2xl relative overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
               <div className="w-12 h-12 border-2 border-[#5856d6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-12">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#5856d6]/10 rounded-full mb-4">
                    <Sparkles size={12} className="text-[#5856d6]" />
                    <span className="text-[9px] font-luxury tracking-widest text-[#5856d6] uppercase">Management Portal</span>
                  </div>
                  <h3 className="text-4xl font-bold tracking-tighter">Account Details</h3>
                </div>
                
                <button
                  onClick={toggleEdit}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-luxury text-[10px] tracking-widest uppercase transition-all duration-500
                    ${isEditing 
                      ? 'bg-[#4caf50] text-white shadow-lg shadow-[#4caf50]/20' 
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}
                  `}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isEditing ? (
                    <><Save size={14} /> Commit Changes</>
                  ) : (
                    <><Edit3 size={14} /> Modify Identity</>
                  )}
                </button>
              </div>

              {/* Success Notification */}
              {success && (
                <div className="bg-[#4caf50]/10 border border-[#4caf50]/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                  <CheckCircle2 size={18} className="text-[#4caf50]" />
                  <p className="text-sm font-light text-[#4caf50]">Identity update successful. Your profile is updated.</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-12">
                {/* Username/Name */}
                <div className="space-y-4">
                  <label className="text-[10px] font-luxury tracking-[0.3em] text-white/30 uppercase ml-1 block">Account Name</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#5856d6] transition-colors" size={18} />
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Your display name"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-xl font-light outline-none focus:border-[#5856d6]/50 focus:bg-white/[0.05] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Initials */}
                <div className="space-y-4">
                  <label className="text-[10px] font-luxury tracking-[0.3em] text-white/30 uppercase ml-1 block">Your Sign (Initials)</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#5856d6] transition-colors font-luxury text-sm">ID</div>
                    <input
                      ref={initialsRef}
                      value={initials}
                      onChange={(e) => setInitials(e.target.value.toUpperCase())}
                      disabled={!isEditing}
                      placeholder="e.g. JD"
                      maxLength={3}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-2xl font-light tracking-widest outline-none focus:border-[#5856d6]/50 focus:bg-white/[0.05] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Meeting Link */}
                <div className="space-y-4">
                  <label className="text-[10px] font-luxury tracking-[0.3em] text-white/30 uppercase ml-1 block">Session Meeting Link</label>
                  <div className="relative group">
                    <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#5856d6] transition-colors" size={18} />
                    <input
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://meet.google.com/..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-6 text-lg font-light outline-none focus:border-[#5856d6]/50 focus:bg-white/[0.05] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center gap-4 opacity-20">
                 <Wind size={16} />
                 <p className="text-[9px] font-luxury tracking-[0.2em] uppercase leading-relaxed">
                   These identifiers are used to establish trust and presence within the platform. Ensure your meeting space is prepared for professional support.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-12 text-white/5 font-luxury text-[10px] tracking-[1.5em] uppercase left-1/2 -translate-x-1/2 pointer-events-none">
        I D E N T I T Y • G U I D E
      </div>
    </div>
  );
};

export default CounsellorProfilePage;
