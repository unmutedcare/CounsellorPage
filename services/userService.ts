import { auth, db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

export const getUserProfile = async () => {
  const user = auth?.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "Users", user.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    if (userData.role === 'counsellor' || userData.role === 'COUNSELOR') {
      const counsellorDoc = await getDoc(doc(db, "Counsellors", user.uid));
      if (counsellorDoc.exists()) {
        return { ...userData, ...counsellorDoc.data() };
      }
    }
    return userData;
  }
  return null;
};

export const updateUserProfile = async (data: { 
  username?: string; 
  initials?: string; 
  meetingLink?: string;
  role?: string;
}) => {
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
  const counsellorRef = doc(db, "Counsellors", user.uid);

  const updateObj: any = {
    ...data,
    updatedAt: new Date()
  };

  await updateDoc(userRef, updateObj);

  // If it's a counsellor, also update the Counsellors collection
  const userSnap = await getDoc(userRef);
  const role = userSnap.data()?.role;
  if (role === 'counsellor' || role === 'COUNSELOR') {
    const counsellorSnap = await getDoc(counsellorRef);
    if (counsellorSnap.exists()) {
      await updateDoc(counsellorRef, updateObj);
    }
  }
};
