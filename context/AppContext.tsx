
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Session, Slot, UserRole } from '../types';
import { MOCK_AVAILABLE_SLOTS, MOCK_PAST_SESSIONS } from '../constants';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  
  availableSlots: Slot[];
  addAvailableSlot: (date: Date, timeLabel: string) => void;
  removeAvailableSlot: (slotId: string) => void;
  
  bookedSessions: Session[];
  addSession: (session: Session) => void;
  
  selectedSlot: Slot | null;
  setSelectedSlot: (slot: Slot | null) => void;
  selectedEmotions: string[];
  toggleEmotion: (emoji: string) => void;
  feelingNote: string;
  setFeelingNote: (note: string) => void;
  resetBookingFlow: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>(MOCK_AVAILABLE_SLOTS);
  const [bookedSessions, setBookedSessions] = useState<Session[]>(MOCK_PAST_SESSIONS);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [feelingNote, setFeelingNote] = useState<string>('');

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
  };

  const addSession = (session: Session) => {
    setBookedSessions((prev) => [...prev, session]);
  };

  const addAvailableSlot = (date: Date, timeLabel: string) => {
    setAvailableSlots(prev => {
      // Comparison logic: check if this EXACT slot (day + time) exists for current counselor
      const dateStr = date.toLocaleDateString('en-US');
      const isDuplicate = prev.some(s => {
        const sDate = new Date(s.fullDate).toLocaleDateString('en-US');
        return sDate === dateStr && s.time === timeLabel && s.counselorName === 'You';
      });

      if (isDuplicate) return prev;

      const newSlot: Slot = {
        id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        counselorName: 'You',
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        time: timeLabel,
        fullDate: date.toISOString(),
      };
      
      return [...prev, newSlot];
    });
  };

  const removeAvailableSlot = (slotId: string) => {
    setAvailableSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const toggleEmotion = (emoji: string) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emoji)) {
        return prev.filter(e => e !== emoji);
      } else {
        return [...prev, emoji];
      }
    });
  };

  const resetBookingFlow = () => {
    setSelectedSlot(null);
    setSelectedEmotions([]);
    setFeelingNote('');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isAuthenticated,
        login,
        logout,
        availableSlots,
        addAvailableSlot,
        removeAvailableSlot,
        bookedSessions,
        addSession,
        selectedSlot,
        setSelectedSlot,
        selectedEmotions,
        toggleEmotion,
        feelingNote,
        setFeelingNote,
        resetBookingFlow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
