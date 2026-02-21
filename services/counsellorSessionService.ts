import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export const fetchCounsellorSessions = async () => {
  const counsellor = auth.currentUser;
  if (!counsellor) return [];

  // More efficient: query VideoCallSession directly as it contains counsellorId
  const q = query(
    collection(db, "VideoCallSession"),
    where("selectedSlot.counsellorId", "==", counsellor.uid)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const slot = data.selectedSlot || {};
    return {
      id: doc.id,
      studentId: data.studentId || "Unknown",
      date: slot.date || "",
      time: slot.time || "",
      status: data.status || "pending",
      ...data
    };
  });
};
