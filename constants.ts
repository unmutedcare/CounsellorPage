
import { Slot, Session } from './types';

// Helper to get a date in the past
const getPastDate = (daysToSubtract: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysToSubtract);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const AVAILABLE_TIMES = [
  { label: '09:00 AM', hour: 9, minute: 0 },
  { label: '10:30 AM', hour: 10, minute: 30 },
  { label: '01:00 PM', hour: 13, minute: 0 },
  { label: '02:30 PM', hour: 14, minute: 30 },
  { label: '04:00 PM', hour: 16, minute: 0 },
  { label: '05:30 PM', hour: 17, minute: 30 },
  { label: '08:00 PM', hour: 20, minute: 0 }
];

const generateMockSlots = () => {
  const slots: Slot[] = [];
  const counselors = ['Sarah Jenkins', 'Mike Ross', 'Jessica Pearson', 'Harvey Specter', 'Louis Litt'];
  
  // Fix reference to today
  const today = new Date();

  // Generate slots for the next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // For each day, pick a subset of times/counselors
    AVAILABLE_TIMES.forEach((time, index) => {
        // Randomly determine if this specific slot exists (70% chance)
        if (Math.random() > 0.3) { 
             const dateObj = new Date(date);
             dateObj.setHours(time.hour, time.minute, 0, 0);
             
             // Pick a random counselor
             const counselor = counselors[Math.floor(Math.random() * counselors.length)];

             // Fix: Use index-based unique ID to prevent React duplicate key errors
             slots.push({
                 id: `slot-${i}-${index}`,
                 counselorName: counselor,
                 day: date.toLocaleDateString('en-US', { weekday: 'long' }),
                 time: time.label,
                 fullDate: dateObj.toISOString()
             });
        }
    });
  }
  return slots;
};

export const MOCK_AVAILABLE_SLOTS: Slot[] = generateMockSlots();

export const MOCK_PAST_SESSIONS: Session[] = [
  {
    id: 'hist1',
    slotId: 'old1',
    counselorName: 'Dr. Phil',
    studentName: 'You',
    day: 'Last Monday',
    time: '2:00 PM',
    fullDate: getPastDate(7, 14),
    status: 'COMPLETED',
    meetingLink: '#',
    emotions: ['😌']
  }
];
