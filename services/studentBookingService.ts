import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";


export const fetchMyBookings = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  // 1. Fetch from the dedicated Bookings collection
  const sessionsRef = collection(db, "Bookings", user.uid, "sessions");
  const snapshot = await getDocs(sessionsRef);

  const bookings = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      counsellorUID: data.counsellorUID || "",
      counsellorName: data.counsellorName || "Anonymous",
      date: data.date || "",
      time: data.time || "",
      meetingLink: data.meetingLink || "",
      status: data.status || "upcoming",
      createdAt: data.createdAt || null,
    };
  });

  // 2. FAIL-SAFE: Check VideoCallSession for any "paid" sessions belonging to this student
  // that might have been missed in the Bookings collection.
  const failSafeQuery = query(
    collection(db, "VideoCallSession"),
    where("student.uid", "==", user.uid),
    where("status", "in", ["paid", "live"])
  );
  
  const failSafeSnap = await getDocs(failSafeQuery);
  const foundSessionIds = new Set(bookings.map(b => b.id));

  failSafeSnap.forEach(doc => {
    if (!foundSessionIds.has(doc.id)) {
      const data = doc.data();
      const slot = data.selectedSlot || {};
      bookings.push({
        id: doc.id,
        counsellorUID: data.counsellorId || slot.counsellorId || "",
        counsellorName: slot.counsellorUsername || "Anonymous",
        date: slot.date || "",
        time: slot.time || "",
        meetingLink: data.meetingLink || "",
        status: "upcoming",
        createdAt: data.createdAt || null,
      });
    }
  });

  return bookings;
};
