import { db, auth } from "../firebase/firebase";   
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

export const fetchUpcomingCases = async () => {
  const user = auth?.currentUser;

  if (!user) return [];

  const q = query(
    collection(db, "VideoCallSession"),
    where("selectedSlot.counsellorId", "==", user.uid),
    where("status", "in", ["paid", "live"]),
    orderBy("sessionTimestamp")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    const ts = data.sessionTimestamp.toDate();

    return {
      id: docSnap.id,
      student: data.student?.username || "Unknown",
      date: ts.toLocaleDateString(),
      time: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: data.status,
      meetingLink: data.meetingLink || ""
    };
  });
};

export const markSessionCompleted = async (sessionId: string) => {
  await updateDoc(doc(db, "VideoCallSession", sessionId), {
    status: "completed"
  });
};