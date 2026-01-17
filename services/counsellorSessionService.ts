import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export const fetchCounsellorSessions = async () => {
  const counsellor = auth.currentUser;
  if (!counsellor) return [];

  const snapshot = await getDocs(collection(db, "Bookings"));

  const all: any[] = [];

  for (const studentDoc of snapshot.docs) {
    const sessionsRef = collection(db, "Bookings", studentDoc.id, "sessions");
    const sessionsSnap = await getDocs(sessionsRef);

    sessionsSnap.forEach(doc => {
      const data = doc.data();
      if (data.counsellorUID === counsellor.uid) {
        all.push({ id: doc.id, studentId: studentDoc.id, ...data });
      }
    });
  }

  return all;
};
