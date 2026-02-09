import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { EMOJIS } from "../../types";
import Button from "../../components/Button";
import { saveEmotions } from "../../services/Student_Emotion_BackEnd";

const EmotionSelection: React.FC = () => {
  const navigate = useNavigate();
  const { selectedEmotions, toggleEmotion } = useApp();
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-col flex-grow pt-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#3E5C35]">
          How are you feeling today?
        </h2>
        <p className="text-[#5B8C5A]">
          Select all that apply.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {EMOJIS.map((item) => {
          const isSelected = selectedEmotions.includes(item.emoji);

          return (
            <button
              key={item.id}
              onClick={() => toggleEmotion(item.emoji)}
              className={`p-6 rounded-2xl transition-all text-center
                ${isSelected
                  ? "bg-white text-black scale-105 shadow-xl"
                  : "bg-white/40 hover:bg-white"}
              `}
            >
              <div className="text-4xl mb-2">{item.emoji}</div>
              <div className="text-sm font-semibold">{item.label}</div>
            </button>
          );
        })}
      </div>

      <Button
        fullWidth
        disabled={selectedEmotions.length === 0 || saving}
        onClick={async () => {
          setSaving(true);

          // Save emotions to backend and get the random sessionId
          const { sessionId, error } = await saveEmotions(selectedEmotions);

          if (error || !sessionId) {
            alert(error || "Failed to generate session ID");
            setSaving(false);
            return;
          }

          setSaving(false);
          navigate("/student/problem-description", {
            state: { sessionId: sessionId },
          });
        }}
      >
        {saving ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
};

export default EmotionSelection;
