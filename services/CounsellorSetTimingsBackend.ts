import {
  doc,
  collection,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface TimingsMap {
  [date: string]: string[];
}

export class CounsellorTimingBackend {
  private db = db;

  constructor(private counsellorId: string) {}

  // ----------------------------------------------------
  // Ensure counsellor document + sessions map exists
  // ----------------------------------------------------
  async initializeCounsellorDocument(): Promise<void> {
    const ref = doc(this.db, "Counsellors", this.counsellorId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: this.counsellorId,
        sessions: {},
        createdAt: serverTimestamp(),
      });
      return;
    }

    if (!snap.data().sessions) {
      await updateDoc(ref, { sessions: {} });
    }
  }

  // ----------------------------------------------------
  // Get counsellor sessions map
  // ----------------------------------------------------
  async getCounsellorSessions(): Promise<TimingsMap> {
    const ref = doc(this.db, "Counsellors", this.counsellorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return {};
    return (snap.data().sessions || {}) as TimingsMap;
  }

  // ----------------------------------------------------
  // Save sessions + sync global
  // ----------------------------------------------------
async saveSessions(timings: TimingsMap): Promise<void> {
  await this.initializeCounsellorDocument();

  const counsellorRef = doc(this.db, "Counsellors", this.counsellorId);
  const snap = await getDoc(counsellorRef);
  if (!snap.exists()) throw new Error("Counsellor not found");

  const data = snap.data();
  const initials = data.initials ?? "NA";
  const username = data.username ?? "";
  const email = data.email ?? "";

  // 🔁 Sync EACH date independently (just like Flutter)
  for (const [date, times] of Object.entries(timings)) {
    await this.syncGlobalSessions(
      date,
      times,
      initials,
      username,
      email
    );
  }
}
  // ----------------------------------------------------
  // Sync GlobalSessions per date
  // ----------------------------------------------------
 private async syncGlobalSessions(
  date: string,
  desiredTimes: string[],
  initials: string,
  username: string,
  email: string
) {
  const globalRef = collection(this.db, "GlobalSessions");
  const counsellorRef = doc(this.db, "Counsellors", this.counsellorId);

  const q = query(
    globalRef,
    where("counsellorId", "==", this.counsellorId),
    where("date", "==", date)
  );

  const snap = await getDocs(q);

  const existingByTime: Record<string, any> = {};
  snap.forEach(d => {
    existingByTime[d.data().time] = d;
  });

  const desiredSet = new Set(desiredTimes);

  // ➕ CREATE missing slots
  for (const time of desiredSet) {
    if (!existingByTime[time]) {
      await addDoc(globalRef, {
        counsellorId: this.counsellorId,
        counsellorInitials: initials,
        counsellorUsername: username,
        counsellorEmail: email,
        date,
        time,
        isBooked: false,
        bookedBy: null,
        timestamp: serverTimestamp(),
      });
    }
  }

  // ➖ DELETE removed slots (ONLY if not booked)
  for (const [time, docSnap] of Object.entries(existingByTime)) {
    if (!desiredSet.has(time) && !docSnap.data().isBooked) {
      await deleteDoc(docSnap.ref);
    }
  }

  // ✅ UPDATE counsellor.sessions PER DATE (CRITICAL FIX)
  const sortedTimes = [...desiredTimes].sort();

  await setDoc(
    counsellorRef,
    {
      sessions: {
        [date]: sortedTimes,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
}