import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const fetchCounsellorsForStudent = async () => {
  try {
    const snapshot = await getDocs(collection(db, "Counsellors"));

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        uid: doc.id,
        initials: data.initials || "",
        sessions: data.sessions || {},
      };
    });
  } catch (error) {
    console.error("Error fetching counsellors:", error);
    return [];
  }
};
