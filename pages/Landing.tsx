import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Wind, Zap } from "lucide-react";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showPolicy, setShowPolicy] = useState(false);

  const handleAccept = () => {
    setShowPolicy(false);
    navigate("/role-select");
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 overflow-hidden flex flex-col items-center justify-center p-6 text-white text-center">
      
      <div className="relative z-10 max-w-5xl reveal">
        
        {/* Logo */}
        <div className="mb-12">
           <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl mx-auto">
             <img src="/unmutedlogo.webp" alt="Unmuted Logo" className="w-full h-full object-cover" />
           </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-7xl md:text-[10rem] font-bold mb-10 tracking-tighter leading-[0.85] select-none text-white">
          <span className="block opacity-90">Find your</span>
          <span className="italic">Unmuted</span>
          <span className="block opacity-90">voice.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/60 mb-16 max-w-2xl font-light leading-relaxed tracking-wide mx-auto">
          A secure, confidential space for meaningful connection. Talk to a peer counsellor or someone who actually understands you.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-2xl items-center justify-center mx-auto">
          <button 
            onClick={() => setShowPolicy(true)} 
            className="bg-white text-blue-600 group flex items-center gap-4 text-xl px-12 py-5 rounded-[2rem] shadow-2xl hover:scale-105 transition-all duration-500 font-bold whitespace-nowrap"
          >
            <span>Begin the Journey</span>
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>

          {/* Social CTAs */}
          <div className="flex items-center gap-4">
            <a 
              href="https://discord.gg/YUcN98R9qq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#5865F2]/20 hover:bg-[#5865F2]/40 border border-white/10 p-5 rounded-3xl transition-all hover:scale-110 active:scale-95 group shadow-xl backdrop-blur-sm"
              title="Join Discord"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.074 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>

            <a 
              href="https://www.instagram.com/unmutedcare?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#E4405F]/20 hover:bg-[#E4405F]/40 border border-white/10 p-5 rounded-3xl transition-all hover:scale-110 active:scale-95 group shadow-xl backdrop-blur-sm"
              title="Follow Instagram"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={showPolicy} 
        onClose={() => setShowPolicy(false)} 
        onAccept={handleAccept} 
      />
    </div>
  );
};

export default Landing;
