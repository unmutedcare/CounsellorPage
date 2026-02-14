import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

class CountdownBackend {
  private db = db;

  constructor() {
    // db is already initialized above
  }

  /// Fetch session details required for countdown page
  async getSessionDetails(sessionId: string) {
    const ref = doc(this.db, "VideoCallSession", sessionId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error("Session not found");
    }

    const data = snap.data();
    const selectedSlot = data.selectedSlot || {};

    // ✅ Canonical timestamp
    const ts = data.sessionTimestamp;
    const sessionTimestamp = ts.toDate(); // Firestore Timestamp → JS Date

    return {
      sessionTimestamp,

      // Slot info
      date: selectedSlot.date,
      time: selectedSlot.time,

      // Counsellor snapshot
      counsellorInitials: selectedSlot.counsellorInitials || "TBD",
      counsellorUsername: selectedSlot.counsellorUsername || "Unknown",
      counsellorEmail: selectedSlot.counsellorEmail,

      // Optional but useful later
      status: data.status,
    };
  }

  /// Remaining time until session start (in seconds)
  getRemainingTime(sessionTime: Date) {
    const now = new Date();
    const diffMs = sessionTime.getTime() - now.getTime();
    return diffMs <= 0 ? 0 : Math.floor(diffMs / 1000);
  }

  /// Enable join button X minutes before session
  canJoinSession(sessionTime: Date, earlyJoinMinutes: number = 5) {
    const now = new Date();
    const earlyJoinTime = new Date(
      sessionTime.getTime() - earlyJoinMinutes * 60 * 1000
    );

    return now >= earlyJoinTime;
  }

  /// 🔗 Fetch meeting link
  async getMeetingLink(sessionId: string) {
    const ref = doc(this.db, "VideoCallSession", sessionId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error("Session not found");
    }

    const link = snap.data()?.meetingLink;

    if (!link) {
      throw new Error("Meeting link not available");
    }

    return link;
  }

  /// 🔄 Mark session as live (recommended)
  async markSessionLive(sessionId: string) {
    const ref = doc(this.db, "VideoCallSession", sessionId);

    await updateDoc(ref, {
      status: "live",
      updatedAt: serverTimestamp(),
    });
  }
}

export default CountdownBackend;
