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
    const userRef = doc(this.db, "Users", counsellorId);

    try {
      await runTransaction(this.db, async (transaction) => {
        // 1️⃣ Check slot availability
        const slotSnapshot = await transaction.get(slotRef);
        if (!slotSnapshot.exists()) throw new Error("Slot document not found.");
        
        if (slotSnapshot.data()?.isBooked) {
          throw new Error("Slot already booked");
        }

        const slotData = slotSnapshot.data()!;

        // 2️⃣ Fetch counsellor (Check both Counsellors and Users collections for the link)
        let profileData: any = null;
        const counsellorSnapshot = await transaction.get(counsellorRef);
        
        if (counsellorSnapshot.exists()) {
          profileData = counsellorSnapshot.data();
        }

        // If link is missing in Counsellors doc, try the main Users doc
        if (!profileData?.meetingLink || profileData.meetingLink.trim() === "") {
          const userSnapshot = await transaction.get(userRef);
          if (userSnapshot.exists()) {
            profileData = { ...profileData, ...userSnapshot.data() };
          }
        }

        if (!profileData) {
          throw new Error("Counsellor profile not found.");
        }

        const meetingLink = profileData.meetingLink;
        if (!meetingLink || meetingLink.trim() === "") {
          throw new Error("Meeting link not set by counsellor. Please ensure you have set your Google Meet link in your profile.");
        }

        // Get the most up-to-date names
        const finalInitials = profileData.initials || counsellorInitials || "NA";
        const finalUsername = profileData.username || slotData.counsellorUsername || "Counsellor";

        // 3️⃣ Mark VideoCallSession with selected slot details
        const sessionTimestamp = this.buildSessionTimestamp(dateStr, time);

        transaction.update(sessionRef, {
          status: "slot_selected",
          counsellorId,
          selectedSlot: {
            date: dateStr,
            time,
            counsellorId,
            counsellorInitials: finalInitials,
            counsellorUsername: finalUsername,
            counsellorEmail: profileData.email || slotData.counsellorEmail || "",
            slotDocId,
          },
          sessionTimestamp,
          meetingLink,
          updatedAt: serverTimestamp(),
        });
      });
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
