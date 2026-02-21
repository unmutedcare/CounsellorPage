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
    console.log("🚀 STARTING bookSlot:", { sessionId, slotDocId, dateStr, time, counsellorId });
    const slotRef = doc(this.db, "GlobalSessions", slotDocId);
    const sessionRef = doc(this.db, "VideoCallSession", sessionId);
    const counsellorRef = doc(this.db, "Counsellors", counsellorId);

    try {
      await runTransaction(this.db, async (transaction) => {
        // 1️⃣ Check slot availability
        const slotSnapshot = await transaction.get(slotRef);
        console.log("🔍 Slot Snapshot exists:", slotSnapshot.exists());
        if (!slotSnapshot.exists()) throw new Error("Slot document not found in database.");
        
        const isBooked = slotSnapshot.data()?.isBooked ?? true;
        console.log("🔍 Slot isBooked status:", isBooked);

        if (isBooked) {
          throw new Error("Slot already booked");
        }

        const slotData = slotSnapshot.data()!;

        // 2️⃣ Fetch counsellor (meeting link safety check)
        const counsellorSnapshot = await transaction.get(counsellorRef);
        console.log("🔍 Counsellor Snapshot exists:", counsellorSnapshot.exists());
        if (!counsellorSnapshot.exists()) {
          throw new Error("Counsellor profile not found. Please ensure the counsellor has completed their profile setup.");
        }

        const counsellorData = counsellorSnapshot.data()!;
        const meetingLink = counsellorData.meetingLink;
        console.log("🔍 Meeting Link found:", !!meetingLink);

        if (!meetingLink || meetingLink.trim() === "") {
          throw new Error("Meeting link not set by counsellor. A meeting link is required to book a session.");
        }

        // 3️⃣ Mark VideoCallSession with selected slot details
        const sessionTimestamp = this.buildSessionTimestamp(dateStr, time);
        console.log("📅 Session Timestamp built:", sessionTimestamp.toDate());

        transaction.update(sessionRef, {
          status: "slot_selected",
          counsellorId,
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
        console.log("✅ Transaction updates queued successfully");
      });
      console.log("✨ Transaction committed successfully");
    } catch (error: any) {
      console.error("❌ bookSlot error:", error);
      throw error;
    }
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
