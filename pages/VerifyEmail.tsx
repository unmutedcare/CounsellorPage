import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Sparkles, ArrowRight } from "lucide-react";

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 overflow-hidden text-white">
            {/* Background Glows */}
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-[#5856d6] opacity-10 blur-[150px] rounded-full" />
            
            <div className="relative z-10 w-full max-w-[520px] text-center reveal">
                <div className="mb-10 inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full">
                    <Sparkles size={14} className="text-[#5856d6]" />
                    <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Verification Sent</span>
                </div>

                <div className="w-20 h-20 bg-[#5856d6]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#5856d6]/20">
                    <Mail size={40} className="text-[#5856d6]" />
                </div>

                <h1 className="text-5xl font-bold tracking-tighter mb-6">Check your <span className="text-gradient italic">inbox</span></h1>
                
                <p className="text-white/50 text-xl font-light leading-relaxed mb-12">
                    A verification link has been sent to your email address. Please click the link to activate your account.
                </p>

                <div className="glass-panel p-8 border border-white/5 mb-10">
                    <p className="text-sm text-white/40 mb-2 font-luxury tracking-widest uppercase">After verifying</p>
                    <button
                        onClick={() => navigate("/student/login")}
                        className="btn-action w-full flex items-center justify-center gap-3 bg-brand-secondary"
                    >
                        Return to Login
                        <ArrowRight size={20} />
                    </button>
                </div>

                <p className="text-white/20 text-xs font-luxury tracking-[0.3em] uppercase">
                    Security • Privacy • Authenticity
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;