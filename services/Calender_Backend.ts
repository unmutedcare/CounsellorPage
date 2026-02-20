import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

interface SlotCounsellor {
  counsellorId: string;
  initials: string;
  username: string;
  email: string;
  docId: string;
}

type SlotsMap = Record<string, SlotCounsellor[]>;

class CalendarBackend {
  private db = db;

  /**
   * Fetch all available slots for a specific date
   */
  async getAvailableSlots(date: Date): Promise<SlotsMap> {
    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const q = query(
      collection(this.db, "GlobalSessions"),
      where("date", "==", dateStr),
      where("isBooked", "==", false)
    );

    const querySnapshot = await getDocs(q);

    const slots: SlotsMap = {};

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const time = data.time as string;

      slots[time] ??= [];

      slots[time].push({
        counsellorId: data.counsellorId,
        initials: data.counsellorInitials,
        username: data.counsellorUsername,
        email: data.counsellorEmail,
        docId: docSnap.id,
      });
    });

    return slots;
  }

  /**
   * Book a slot for a student's VideoCallSession
   */
  async bookSlot({
    sessionId,
    slotDocId,
    dateStr,
    time,
    counsellorId,
    counsellorInitials,
  }: {
    sessionId: string;
    slotDocId: string;
    dateStr: string;
    time: string;
    counsellorId: string;
    counsellorInitials: string;
  }): Promise<void> {
    const slotRef = doc(this.db, "GlobalSessions", slotDocId);
    const sessionRef = doc(this.db, "VideoCallSession", sessionId);
    const counsellorRef = doc(this.db, "Counsellors", counsellorId);

    await runTransaction(this.db, async (transaction) => {
      // 1️⃣ Check slot availability (Flutter-equivalent)
      const slotSnapshot = await transaction.get(slotRef);
      const isBooked = slotSnapshot.data()?.isBooked ?? true;

      if (!slotSnapshot.exists() || isBooked) {
        throw new Error("Slot already booked");
      }

      const slotData = slotSnapshot.data()!;

      // 2️⃣ Fetch counsellor (meeting link safety check)
      const counsellorSnapshot = await transaction.get(counsellorRef);
      if (!counsellorSnapshot.exists()) {
        throw new Error("Counsellor not found");
      }

      const counsellorData = counsellorSnapshot.data()!;
      const meetingLink = counsellorData.meetingLink;

      if (!meetingLink || meetingLink.trim() === "") {
        throw new Error("Meeting link not set by counsellor");
      }

      // 3️⃣ Mark VideoCallSession with selected slot details (but don't mark GlobalSession as booked yet)
      const sessionTimestamp = this.buildSessionTimestamp(dateStr, time);

      transaction.update(sessionRef, {
        status: "slot_selected", // Changed from "scheduled" to "slot_selected"
        counsellorId, // Add counsellorId at top level for cloud functions
        selectedSlot: {
          date: dateStr,
          time,
          counsellorId,
          counsellorInitials,
          counsellorUsername: slotData.counsellorUsername,
          counsellorEmail: slotData.counsellorEmail,
          slotDocId,
        },
        sessionTimestamp,
        meetingLink,
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * 🔧 Converts date + time into Firestore Timestamp
   */
  private buildSessionTimestamp(date: string, time: string): Timestamp {
    const [year, month, day] = date.split("-").map(Number);

    let hour: number;
    let minute: number;

    // Case 1: "10:00 AM"
    if (time.includes(" ")) {
      const [hm, period] = time.split(" ");
      const [h, m] = hm.split(":");
      hour = parseInt(h);
      minute = parseInt(m);

      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
    }
    // Case 2: "10:00" or "18:30"
    else {
      const [h, m] = time.split(":");
      hour = parseInt(h);
      minute = parseInt(m);
    }

    return Timestamp.fromDate(
      new Date(year, month - 1, day, hour, minute)
    );
  }
}

export default CalendarBackend;
