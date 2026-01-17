import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export const bookSession = async (
  counsellorUID: string,
  counsellorName: string,
  date: string,
  time: string
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const bookingRef = collection(db, "Bookings", user.uid, "sessions");

  await addDoc(bookingRef, {
    counsellorUID,
    counsellorName,
    date,
    time,
    status: "upcoming",
    createdAt: serverTimestamp(),
  });
};
