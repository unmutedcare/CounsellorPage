
export type UserRole = 'STUDENT' | 'COUNSELOR' | null;

export interface Slot {
  id: string;
  counselorName: string;
  day: string;
  time: string; // Format: "HH:mm" 24h or "h PM/AM"
  fullDate: string; // ISO string for comparison
}

export interface EmojiOption {
  id: string;
  emoji: string;
  label: string;
}

export interface Session {
  id: string;
  slotId: string;
  counselorName: string;
  studentName: string; // Hardcoded to "You" for this demo
  day: string;
  time: string;
  fullDate: string;
  status: 'UPCOMING' | 'COMPLETED';
  emotions?: string[]; // Changed from single emotion to array
  note?: string;
  meetingLink: string;
}

export const EMOJIS: EmojiOption[] = [
  { id: '1', emoji: '😊', label: 'Happy' },
  { id: '2', emoji: '😌', label: 'Relieved' },
  { id: '3', emoji: '😐', label: 'Neutral' },
  { id: '4', emoji: '😔', label: 'Sad' },
  { id: '5', emoji: '😣', label: 'Stressed' },
  { id: '6', emoji: '😡', label: 'Angry' },
  { id: '7', emoji: '😨', label: 'Anxious' },
  { id: '8', emoji: '😴', label: 'Tired' },
  { id: '9', emoji: '🤯', label: 'Overwhelmed' },
  { id: '10', emoji: '🤒', label: 'Unwell' },
];
