import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

/* ---------------------------------------------
   Types
--------------------------------------------- */

export interface CompletedCase {
  sessionId: string;
  studentName: string;
  date: string;
  description: string;
}

/* ---------------------------------------------
   Fetch Completed Cases
--------------------------------------------- */

export async function getCompletedCases(): Promise<CompletedCase[]> {
  const q = query(
    collection(db, "VideoCallSession"),
    where("status", "==", "completed"),
    orderBy("sessionTimestamp", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const student = data.student ?? {};

    const ts = data.sessionTimestamp as Timestamp;
    const dt = ts.toDate();

    return {
      sessionId: doc.id,
      studentName: student.username ?? "Unknown",

      date:
        `${String(dt.getDate()).padStart(2, "0")}/` +
        `${String(dt.getMonth() + 1).padStart(2, "0")}/` +
        `${dt.getFullYear()}`,

      description: data.description ?? "",
    };
  });
}
