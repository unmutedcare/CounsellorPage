import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MessageSquare, Sparkles, Compass, Zap, Book, Wind, ChevronRight, ChevronLeft, Clock, Calendar } from "lucide-react";
import { fetchMyBookings } from "../../services/studentBookingService";

const quotes = [
  `"The oak fought the wind and was broken, the willow bent when it must and survived." – Robert Jordan`,
  `"Sometimes the people around you won't understand your journey. It's not for them." – Joubert Botha`,
  `"Healing takes time, and asking for help is a courageous step." – Mariska Hargitay`,
  `"You don't have to control your thoughts. You just have to stop letting them control you." – Dan Millman`,
];

const getQuoteOfTheDay = () => {
  const day = new Date().getDate();
  return quotes[day % quotes.length];
};

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
      const bookings = await fetchMyBookings();
      setUpcomingSessions(bookings.filter(b => b.status === 'upcoming'));
    };
    loadSessions();
  }, []);

  const handleTalkToSomeone = async () => {
    setLoading(true);
    navigate("/student/emotion-selection");
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white p-6 pb-24 overflow-x-hidden">
      {/* Aesthetic Background Glows */}
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary opacity-5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary opacity-5 blur-[120px] rounded-full" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10 pt-8">
        
        {/* QUOTE SECTION */}
        <div className="glass-panel p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Book size={80} />
          </div>
          <div className="flex gap-6 items-start">
            <span className="text-4xl text-brand-primary font-serif italic">"</span>
            <p className="text-xl md:text-2xl font-light leading-relaxed text-white/80">
              {getQuoteOfTheDay()}
            </p>
          </div>
        </div>

        {/* HERO CTA */}
        <div 
          onClick={handleTalkToSomeone}
          className="relative group cursor-pointer"
        >
          <div className="absolute -inset-1 accent-gradient rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass-panel p-12 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-brand-primary opacity-10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="text-center md:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/20 rounded-full mb-6">
                <Sparkles size={14} className="text-brand-primary" />
                <span className="text-[10px] font-luxury tracking-widest text-brand-primary uppercase">Connect with Support</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">Book a <span className="text-gradient italic">Session</span></h1>
              <p className="text-white/40 text-lg font-light max-w-md">Schedule a private, 30-minute session with a certified peer counselor in our secure network.</p>
            </div>

            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/10 shadow-xl">
               <MessageSquare size={40} className="text-white group-hover:text-brand-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* UPCOMING SESSIONS */}
        {upcomingSessions.length > 0 && (
          <div className="space-y-6 reveal">
            <div className="flex items-center gap-3">
               <Clock size={20} className="text-brand-primary" />
               <h2 className="text-xl font-luxury tracking-[0.2em] text-white/60 uppercase">Scheduled Sessions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingSessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => navigate(`/student/countdown?sessionId=${session.id}`)}
                  className="glass-panel p-8 border border-white/5 hover:border-brand-primary/30 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                         <span className="text-[8px] font-luxury tracking-widest text-brand-primary uppercase">Confirmed</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-white/90">Session with {session.counsellorName}</h3>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-1.5 text-[10px] font-luxury tracking-widest text-white/30 uppercase">
                             <Calendar size={12} className="text-brand-primary/50" /> {session.date}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-luxury tracking-widest text-white/30 uppercase">
                             <Clock size={12} className="text-brand-primary/50" /> {session.time}
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-brand-primary/20 transition-colors">
                       <ChevronRight size={20} className="text-white/20 group-hover:text-brand-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPLORE SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <Compass size={20} className="text-brand-secondary" />
             <h2 className="text-xl font-luxury tracking-[0.2em] text-white/60">RESOURCES</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard 
              icon={<Zap size={20}/>} 
              text="AI Support" 
              badge="BETA" 
              color="#6366f1" 
            />
            
            <a href="https://discord.gg/YUcN98R9qq" target="_blank" rel="noopener noreferrer" className="block h-full">
              <FeatureCard 
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 10h.01M15 10h.01M7 15c.01 0 7 0 10 0M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l4.85-.85C8.29 21.623 10.064 22 12 22z" />
                  </svg>
                } 
                text="Join Discord Community" 
                badge="JOIN NOW" 
                color="#5865F2" 
                clickable
              />
            </a>

            <a href="https://www.instagram.com/unmutedcare?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="block h-full">
              <FeatureCard 
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                } 
                text="Follow on Instagram" 
                badge="FOLLOW US" 
                color="#E4405F" 
                clickable
              />
            </a>
          </div>
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
           <div className="w-16 h-16 border-2 border-brand-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, text, badge, color, clickable = false }: { icon: any, text: string, badge: string, color: string, clickable?: boolean }) => (
  <div className={`glass-panel p-6 border border-white/5 transition-all h-full group ${clickable ? 'hover:border-white/20 cursor-pointer active:scale-95' : 'cursor-not-allowed'}`}>
    <div className="flex flex-col gap-6">
       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <div style={{ color }}>{icon}</div>
       </div>
       <div>
          <div className="text-[9px] font-luxury tracking-[0.2em] mb-2 opacity-40 uppercase">{badge}</div>
          <p className="text-sm font-semibold tracking-wide text-white/70">{text}</p>
       </div>
    </div>
  </div>
);

export default StudentDashboard;
