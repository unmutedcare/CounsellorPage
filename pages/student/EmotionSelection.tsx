import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { EMOJIS } from "../../types";
import { saveEmotions } from "../../services/Student_Emotion_BackEnd";
import { Sparkles, ArrowRight } from "lucide-react";

const EmotionSelection: React.FC = () => {
  const navigate = useNavigate();
  const { selectedEmotions, toggleEmotion } = useApp();
  const [saving, setSaving] = useState(false);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col p-6 overflow-x-hidden">
      {/* Background Accents */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary opacity-5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary opacity-5 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col flex-grow reveal">
        {/* Header */}
        <div className="text-center mb-16 mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
            <Sparkles size={14} className="text-brand-primary" />
            <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Emotional Status</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            How are you <span className="text-gradient italic">feeling</span> today?
          </h2>
          <p className="text-white/40 text-xl font-light tracking-wide">
            Select the emotions that best describe your current state.
          </p>
        </div>

        {/* Emojis Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-20">
          {EMOJIS.map((item) => {
            const isSelected = selectedEmotions.includes(item.emoji);

            return (
              <button
                key={item.id}
                onClick={() => toggleEmotion(item.emoji)}
                className={`group relative p-8 rounded-[2rem] transition-all duration-500 overflow-hidden
                  ${isSelected
                    ? "glass-panel border-brand-primary/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] scale-105"
                    : "glass-panel border-white/5 hover:border-white/20"}
                `}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-brand-primary/10 animate-pulse" />
                )}
                <div className={`text-5xl mb-4 transition-transform duration-500 group-hover:scale-125 ${isSelected ? 'scale-110' : ''}`}>
                  {item.emoji}
                </div>
                <div className={`text-xs font-luxury tracking-[0.2em] uppercase transition-colors duration-500 ${isSelected ? 'text-brand-primary' : 'text-white/40'}`}>
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-auto pb-12 w-full max-w-md mx-auto">
          <button
            disabled={selectedEmotions.length === 0 || saving}
            onClick={async () => {
              setSaving(true);
              const { sessionId, error } = await saveEmotions(selectedEmotions);

              if (error || !sessionId) {
                alert(error || "Failed to process selection. Please try again.");
                setSaving(false);
                return;
              }

              setSaving(false);
              navigate("/student/problem-description", {
                state: { sessionId: sessionId },
              });
            }}
            className={`btn-action w-full flex items-center justify-center gap-4 text-xl py-6 shadow-2xl transition-all duration-700
              ${selectedEmotions.length === 0 ? 'opacity-20 cursor-not-allowed grayscale' : 'shadow-brand-secondary/30'}
            `}
          >
            <span>{saving ? "Processing..." : "Next Step"}</span>
            {!saving && <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmotionSelection;
