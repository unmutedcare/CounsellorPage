import { auth, db } from "../firebase/firebase";
import {
  doc,
  setDoc,
  collection,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export const saveEmotions = async (
  emotions: string[]
): Promise<{ sessionId: string | null; error: string | null }> => {
  try {
    const user = auth?.currentUser;

    if (!user) {
      return { sessionId: null, error: "User not logged in" };
    }

    // 🔹 Fetch student details from Users collection
    const userRef = doc(db, "Users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { sessionId: null, error: "User data not found" };
    }

    const userData = userSnap.data();

    // 🔹 Create random session document
    const sessionRef = doc(collection(db, "VideoCallSession"));
    const sessionId = sessionRef.id;

    // 🔹 Save full session data (Flutter-compatible)
    await setDoc(sessionRef, {
      sessionId: sessionId,
      student: {
        uid: user.uid,
        email: userData.email,
        username: userData.username || userData.email.split("@")[0] || "Student",
        role: userData.role,
      },
      emotions: emotions,
      description: null,
      status: "emotions_selected",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { sessionId, error: null };
  } catch (error: any) {
    console.error("Error saving emotions:", error);
    return {
      sessionId: null,
      error: error.message || "Failed to save emotions",
    };
  }
};
