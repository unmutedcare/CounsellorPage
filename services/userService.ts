import { auth, db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

export const getUserProfile = async () => {
  const user = auth?.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "Users", user.uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

export const updateUserProfile = async (data: { username?: string }) => {
  const user = auth?.currentUser;
  if (!user) throw new Error("User not authenticated");

  // If username is being updated, check for uniqueness
  if (data.username) {
    const q = query(collection(db, "Users"), where("username", "==", data.username.trim()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty && snapshot.docs[0].id !== user.uid) {
      throw new Error("Username already taken");
    }
  }

  const userRef = doc(db, "Users", user.uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: new Date()
  });
};
