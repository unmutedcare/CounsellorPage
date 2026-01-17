import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import { CalendarCheck, Video, CheckCircle2 } from 'lucide-react';
import { Session } from '../../types';

const MeetingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookedSessions, resetBookingFlow } = useApp();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [canJoin, setCanJoin] = useState(false);

  // Retrieve the session to display
  useEffect(() => {
    // Clean up the booking flow state in context now that we are confirmed
    resetBookingFlow();

    const state = location.state as { sessionId?: string } | null;
    if (state?.sessionId) {
      const session = bookedSessions.find(s => s.id === state.sessionId);
      if (session) setCurrentSession(session);
    } else {
      // Fallback: show latest upcoming session if navigating directly
      const upcoming = bookedSessions.filter(s => s.status === 'UPCOMING').sort((a,b) => Number(b.id) - Number(a.id))[0];
      if (upcoming) setCurrentSession(upcoming);
    }
  }, [location.state, bookedSessions]);

  // Check if meeting can be joined (mock logic)
  useEffect(() => {
    if (!currentSession) return;

    const checkTime = () => {
      const now = new Date();
      const sessionTime = new Date(currentSession.fullDate);
      
      // Allow joining 5 minutes before
      // For DEMO purposes: If the date is strictly in the future, disable. 
      // If it's today/past, enable.
      // Ideally: now >= sessionTime - 5min
      
      // let timeDiff = sessionTime.getTime() - now.getTime();
      // setCanJoin(timeDiff <= 5 * 60 * 1000); 

      // DEMO LOGIC: Always enable for ease of testing, or disable if specifically desired.
      // Let's implement the prompt rule: "only when current time >= session time"
      setCanJoin(now >= sessionTime);
    };

    checkTime();
    const interval = setInterval(checkTime, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [currentSession]);

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-[#5B8C5A]">No upcoming sessions scheduled.</p>
        <Button variant="ghost" onClick={() => navigate('/student/dashboard')} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  const handleJoin = () => {
    window.open(currentSession.meetingLink, '_blank');
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
      
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl text-center w-full max-w-sm border-t-4 border-[#7CAB48]">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-[#7CAB48]" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">You're Set!</h2>
        <p className="text-gray-600 mb-6">Your session is scheduled.</p>

        <div className="bg-[#E8F3D6] p-4 rounded-xl mb-6 space-y-2">
           <div className="flex items-center justify-center text-[#2d4026] font-bold text-lg gap-2">
              <CalendarCheck className="w-5 h-5" />
              {currentSession.day}
           </div>
           <div className="text-[#5B8C5A] font-semibold text-2xl">
             {currentSession.time}
           </div>
           <div className="text-sm text-gray-500 border-t border-[#cde0b4] pt-2 mt-2">
             with {currentSession.counselorName}
           </div>
        </div>

        <Button 
          fullWidth 
          onClick={handleJoin} 
          disabled={!canJoin}
          className={canJoin ? 'animate-pulse' : ''}
        >
          <Video className="w-5 h-5 mr-2" />
          {canJoin ? 'Join Now' : 'Join Later'}
        </Button>
        
        {!canJoin && (
            <p className="text-xs text-gray-400 mt-3">
                Button activates at appointment time.
            </p>
        )}
      </div>

      <Button variant="ghost" onClick={() => navigate('/student/dashboard')}>
        Back to Home
      </Button>
    </div>
  );
};

export default MeetingPage;