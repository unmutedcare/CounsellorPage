import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";


export const fetchMyBookings = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const sessionsRef = collection(db, "Bookings", user.uid, "sessions");
  const snapshot = await getDocs(sessionsRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      counsellorUID: data.counsellorUID || "",
      counsellorName: data.counsellorName || "Anonymous",
      date: data.date || "",
      time: data.time || "",
      status: data.status || "upcoming",   // 👈 fallback for old bookings
      createdAt: data.createdAt || null,
    };
  });
};
