import { auth, db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";

export const getUserProfile = async () => {
  const user = auth?.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "Users", user.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    const rawRole = (userData.role || "").toUpperCase();
    if (rawRole === 'COUNSELLOR' || rawRole === 'COUNSELOR') {
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

  // 1. Update the main Users document
  await setDoc(userRef, updateObj, { merge: true });

  // 2. Fetch the user to determine role (case-insensitive)
  const userSnap = await getDoc(userRef);
  const rawRole = (userSnap.data()?.role || "").toUpperCase();
  
  // 3. If it's a counsellor, sync everything to the Counsellors collection
  if (rawRole === 'COUNSELLOR' || rawRole === 'COUNSELOR') {
    await setDoc(counsellorRef, {
      ...updateObj,
      uid: user.uid, // Ensure UID is always present
    }, { merge: true });
  }
};
