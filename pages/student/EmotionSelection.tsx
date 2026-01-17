
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { EMOJIS } from '../../types';
import Button from '../../components/Button';

const EmotionSelection: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSlot, selectedEmotions, toggleEmotion } = useApp();

  // Redirect if no slot selected (user refreshed or skipped steps)
  useEffect(() => {
    if (!selectedSlot) navigate('/student/select-timing');
  }, [selectedSlot, navigate]);

  return (
    <div className="flex flex-col flex-grow pt-4 animate-in slide-in-from-right-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#3E5C35]">How are you?</h2>
        <p className="text-[#5B8C5A]">Select all that apply to your mood.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {EMOJIS.map((item) => {
          const isSelected = selectedEmotions.includes(item.emoji);
          return (
            <button
              key={item.id}
              onClick={() => toggleEmotion(item.emoji)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 aspect-square
                ${isSelected 
                  ? 'bg-[#7CAB48] text-white scale-105 shadow-lg ring-2 ring-offset-2 ring-[#7CAB48]' 
                  : 'bg-white/50 hover:bg-white text-gray-700 hover:scale-105'}
              `}
            >
              <span className="text-4xl mb-1">{item.emoji}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        <Button 
          fullWidth 
          onClick={() => navigate('/student/feeling-input')}
          disabled={selectedEmotions.length === 0}
        >
          Next ({selectedEmotions.length})
        </Button>
      </div>
    </div>
  );
};

export default EmotionSelection;
