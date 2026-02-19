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
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-lg items-center justify-center mx-auto">
          <button 
            onClick={() => setShowPolicy(true)} 
            className="bg-white text-blue-600 group flex items-center gap-4 text-xl px-12 py-5 rounded-[2rem] shadow-2xl hover:scale-105 transition-all duration-500 font-bold"
          >
            <span>Begin the Journey</span>
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
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
