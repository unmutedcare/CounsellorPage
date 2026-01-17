
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';

const FeelingInput: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSlot, feelingNote, setFeelingNote, addSession, selectedEmotions, resetBookingFlow } = useApp();

  useEffect(() => {
    if (!selectedSlot) navigate('/student/select-timing');
  }, [selectedSlot, navigate]);

  const handleFinish = () => {
    if (selectedSlot) {
        // Create the session
        const newSession = {
            id: Date.now().toString(),
            slotId: selectedSlot.id,
            counselorName: selectedSlot.counselorName,
            studentName: 'You',
            day: selectedSlot.day,
            time: selectedSlot.time,
            fullDate: selectedSlot.fullDate,
            status: 'UPCOMING' as const,
            emotions: selectedEmotions,
            note: feelingNote,
            meetingLink: 'https://meet.google.com/abc-defg-hij', // Mock link
        };
        addSession(newSession);
        
        navigate('/student/meeting', { state: { sessionId: newSession.id } });
    }
  };

  return (
    <div className="flex flex-col flex-grow pt-4 animate-in slide-in-from-right-10">
       <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#3E5C35]">Want to share more?</h2>
        <p className="text-[#5B8C5A]">You can write a brief note (optional).</p>
      </div>

      <textarea
        className="w-full h-48 p-4 rounded-2xl bg-white/70 border-none focus:ring-2 focus:ring-[#7CAB48] text-gray-700 placeholder-gray-400 resize-none shadow-inner mb-6"
        placeholder="I'm feeling..."
        value={feelingNote}
        onChange={(e) => setFeelingNote(e.target.value)}
      />

      <div className="mt-auto flex gap-4">
        <Button 
          variant="ghost" 
          onClick={handleFinish} 
          className="flex-1 bg-white/30 hover:bg-white/50"
        >
          Skip
        </Button>
        <Button 
          variant="primary" 
          onClick={handleFinish} 
          className="flex-1"
        >
          Finish
        </Button>
      </div>
    </div>
  );
};

export default FeelingInput;
