import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CountdownBackend from "../../services/CountdownPage_backend";
import { Sparkles, Clock, Video, ChevronRight, CheckCircle2, User, Mail } from "lucide-react";

const CountdownPage = ({ sessionId: propSessionId }: { sessionId?: string }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = propSessionId || searchParams.get("sessionId");
    const backend = useRef(new CountdownBackend()).current;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [remaining, setRemaining] = useState(0);
    const [joinEnabled, setJoinEnabled] = useState(false);

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [counsellor, setCounsellor] = useState("TBD");
    const [sessionDateTime, setSessionDateTime] = useState<Date | null>(null);

    const [counsellorUsername, setCounsellorUsername] = useState("");
    const [counsellorEmail, setCounsellorEmail] = useState("");

    const humanize = (seconds: number) => {
        if (seconds <= 0) return "Starting now";

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds / 60);

        if (days >= 7) {
            const weeks = Math.floor(days / 7);
            return weeks === 1 ? "In 1 week" : `In ${weeks} weeks`;
        }

        if (days >= 2) return `In ${days} days`;
        if (days === 1) return "Tomorrow";
        if (hours >= 2) return `In ${hours} hours`;
        if (hours === 1) return "In 1 hour";
        if (minutes >= 2) return `In ${minutes} minutes`;
        if (minutes === 1) return "In 1 minute";

        return "Starting now";
    };

    useEffect(() => {
        loadSession();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const loadSession = async () => {
        if (!sessionId) return;
        try {
            const data = await backend.getSessionDetails(sessionId);
            setSessionDateTime(data.sessionTimestamp);
            setDate(data.date);
            setTime(data.time);
            setCounsellor(data.counsellorInitials);
            setCounsellorUsername(data.counsellorUsername || "");
            setCounsellorEmail(data.counsellorEmail || "");

            const rem = backend.getRemainingTime(data.sessionTimestamp);
            setRemaining(rem);
            setJoinEnabled(backend.canJoinSession(data.sessionTimestamp));
            startCountdown(data.sessionTimestamp);
        } catch (e) {
            console.error("Failed to load session details", e);
        }
    };

    const startCountdown = (timestamp: Date) => {
        timerRef.current = setInterval(() => {
            const rem = backend.getRemainingTime(timestamp);
            setRemaining(rem);
            setJoinEnabled(backend.canJoinSession(timestamp));
            if (rem <= 0 && timerRef.current) {
                clearInterval(timerRef.current);
            }
        }, 1000);
    };

    const handleJoin = async () => {
        try {
            const link = await backend.getMeetingLink(sessionId!);
            await backend.markSessionLive(sessionId!);
            window.open(link, "_blank", "noopener,noreferrer");
        } catch (e) {
            alert("Unable to open meeting link. Please open it manually.\n" + e);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col p-6 overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-brand-primary opacity-[0.03] blur-[150px] rounded-full animate-pulse-glow" />
            
            <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-grow flex-col justify-center reveal">
                {/* Status Header */}
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 animate-subtle-float shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-6xl font-bold tracking-tighter mb-4">Session <span className="text-gradient italic">Confirmed</span></h1>
                    
                    <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full glass-panel border mt-6 transition-all duration-700
                        ${joinEnabled ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 'border-brand-primary/30'}
                    `}>
                        {joinEnabled ? (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        ) : (
                            <Clock size={14} className="text-brand-primary" />
                        )}
                        <span className={`text-xs font-luxury uppercase tracking-[0.3em] font-bold ${joinEnabled ? 'text-green-500' : 'text-brand-primary'}`}>
                            {joinEnabled ? "The portal is open" : humanize(remaining)}
                        </span>
                    </div>
                </div>

                {/* Details Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="glass-panel p-10 border border-white/5 space-y-8">
                        <h3 className="text-sm font-luxury tracking-[0.4em] text-white/30 uppercase border-b border-white/5 pb-4">Schedule</h3>
                        <div className="space-y-6">
                            <InfoItem label="Date" value={date} />
                            <InfoItem label="Session Time" value={time} />
                        </div>
                    </div>

                    <div className="glass-panel p-10 border border-white/5 space-y-8">
                        <h3 className="text-sm font-luxury tracking-[0.4em] text-white/30 uppercase border-b border-white/5 pb-4">Counselor</h3>
                        <div className="space-y-6">
                            <InfoItem label="Name" value={counsellorUsername || counsellor} icon={<User size={14}/>} />
                            <InfoItem label="Contact" value={counsellorEmail || "Encrypted"} icon={<Mail size={14}/>} />
                        </div>
                    </div>
                </div>

                {/* Join CTA */}
                <div className="max-w-md mx-auto w-full mb-12">
                    <button
                        className={`btn-action w-full py-6 text-xl flex items-center justify-center gap-4 transition-all duration-700 shadow-2xl
                            ${joinEnabled ? 'bg-green-600 shadow-green-500/30' : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed grayscale'}
                        `}
                        disabled={!joinEnabled}
                        onClick={handleJoin}
                    >
                        <Video size={24} />
                        <span>Join Session Now</span>
                        <ChevronRight size={24} />
                    </button>
                    {!joinEnabled && (
                        <p className="text-center mt-6 text-[10px] font-luxury tracking-[0.2em] text-white/20 uppercase">
                            Join button activates 5 minutes before your time
                        </p>
                    )}
                </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/5 font-luxury text-[10px] tracking-[1.5em] uppercase pointer-events-none whitespace-nowrap">
                U N M U T E D
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, icon }: { label: string, value: string, icon?: any }) => (
    <div className="space-y-1 group">
        <p className="text-[10px] font-luxury tracking-[0.2em] text-brand-secondary uppercase opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
        <div className="flex items-center gap-3">
            {icon && <div className="text-white/20 group-hover:text-brand-secondary transition-colors">{icon}</div>}
            <p className="text-2xl font-light tracking-tight truncate">{value}</p>
        </div>
    </div>
);

export default CountdownPage;
