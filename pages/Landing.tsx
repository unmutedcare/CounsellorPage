import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Wind, Shield, Zap } from "lucide-react";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
         <img 
           src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=2083&auto=format&fit=crop" 
           alt="Calm Background" 
           className="w-full h-full object-cover opacity-10 scale-110 animate-pulse-glow"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-transparent to-[#0a0a0c]" />
      </div>

      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary opacity-10 blur-[150px] rounded-full animate-subtle-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary opacity-10 blur-[150px] rounded-full animate-subtle-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl reveal">
        
        {/* Floating Tag */}
        <div className="mb-10 inline-flex items-center gap-3 px-6 py-2 glass-panel border border-white/10 rounded-full animate-float">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-[10px] font-luxury uppercase tracking-[0.4em] text-white/80">Professional Support Network</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-7xl md:text-[10rem] font-bold mb-10 tracking-tighter leading-[0.85] select-none">
          <span className="block text-white opacity-90">Find your</span>
          <span className="text-gradient italic drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">Unmuted</span>
          <span className="block text-white opacity-90">voice.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/40 mb-16 max-w-2xl font-light leading-relaxed tracking-wide">
          A secure, confidential space for meaningful connection. Connect with expert guidance in a support platform designed for your mental well-being.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-lg items-center justify-center">
          <button 
            onClick={() => navigate("/role-select")} 
            className="btn-action group flex items-center gap-4 text-xl px-12 py-5 shadow-2xl shadow-brand-primary/20"
          >
            <span>Begin the Journey</span>
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-24 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-2">
             <Shield size={18} />
             <span className="text-[10px] font-luxury tracking-[0.2em]">ENCRYPTED</span>
           </div>
           <div className="flex items-center gap-2">
             <Wind size={18} />
             <span className="text-[10px] font-luxury tracking-[0.2em]">PRIVATE</span>
           </div>
           <div className="flex items-center gap-2">
             <Zap size={18} />
             <span className="text-[10px] font-luxury tracking-[0.2em]">CERTIFIED COUNSELORS</span>
           </div>
        </div>
      </div>

      {/* Decorative Branding */}
      <div className="fixed bottom-12 left-12 flex gap-10 items-center opacity-20 vertical-rl hidden lg:flex">
        <div className="h-32 w-[1px] bg-white" />
        <span className="text-[9px] font-luxury tracking-[1em] text-white uppercase origin-center -rotate-90">EST. 2026</span>
      </div>

      <div className="fixed top-1/2 right-[-6rem] -translate-y-1/2 rotate-90 opacity-5 pointer-events-none select-none">
        <span className="text-[14rem] font-serif text-white whitespace-nowrap tracking-widest uppercase">Support</span>
      </div>
    </div>
  );
};

export default Landing;
