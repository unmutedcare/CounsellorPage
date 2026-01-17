import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export const refreshSessionStatus = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const sessionsRef = collection(db, "Bookings", user.uid, "sessions");
  const snapshot = await getDocs(sessionsRef);

  const now = new Date();

  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.status !== "upcoming") continue;

    const sessionTime = new Date(`${data.date} ${data.time}`);
    if (sessionTime < now) {
      await updateDoc(doc(db, "Bookings", user.uid, "sessions", d.id), {
        status: "completed",
      });
    }
  }
};
