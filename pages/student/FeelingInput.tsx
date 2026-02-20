import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Wind, MessageSquare, FastForward, ArrowRight } from "lucide-react";

const FeelingInput: React.FC = () => {
  const navigate = useNavigate();
  const { selectedEmotions } = useApp();
  const [loading, setLoading] = useState(false);
  const [feelingNote, setFeelingNote] = useState("");

  const handleFinish = () => {
    setLoading(true);
    // Finalize journey and return to dashboard
    setTimeout(() => {
      navigate('/student/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary opacity-5 blur-[120px] rounded-full animate-pulse-glow" />
      
      <div className="relative z-10 w-full max-w-2xl reveal">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
            <Wind size={14} className="text-brand-secondary" />
            <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Final Reflections</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter mb-4">
            Want to share <span className="text-gradient italic">more?</span>
          </h1>
          <p className="text-white/40 text-xl font-light tracking-wide">
            Your notes help your counselor prepare for your session.
          </p>
        </div>

        {/* Textarea Card */}
        <div className="glass-panel p-8 border border-white/5 shadow-2xl relative overflow-hidden mb-12 group">
          <div className="absolute top-6 left-6 opacity-20 text-brand-secondary group-focus-within:opacity-100 transition-opacity">
            <MessageSquare size={24} />
          </div>
          <textarea
            value={feelingNote}
            onChange={(e) => setFeelingNote(e.target.value)}
            placeholder="Describe your feelings... (optional)"
            className="w-full bg-transparent border-none text-white text-2xl font-light placeholder:text-white/10 outline-none resize-none pt-2 min-h-[240px]"
            autoFocus
          />
        </div>

        {/* Interaction Row */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto">
          <button
            disabled={loading}
            onClick={handleFinish}
            className="flex-1 flex items-center justify-center gap-3 py-5 rounded-full border border-white/10 hover:bg-white/5 transition-all text-white/60 hover:text-white font-luxury text-xs tracking-[0.2em] uppercase"
          >
            <FastForward size={18} />
            Skip
          </button>

          <button
            disabled={loading}
            onClick={handleFinish}
            className="flex-[2] btn-action flex items-center justify-center gap-3 text-lg py-4 shadow-brand-primary/20"
          >
            <span>{loading ? "Finalizing..." : "Finish Setup"}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 text-white/5 font-luxury text-[10px] tracking-[1em] uppercase">
                 SECURE • PRIVATE • RELIABLE      </div>
    </div>
  );
};

export default FeelingInput;
