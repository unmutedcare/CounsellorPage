import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,

} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const auth = getAuth();
const db = getFirestore();
const messaging = getMessaging();

class StudentLoginBackend {
  async loginStudent({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<string | null> {
    try {
      // 1️⃣ Sign in
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      const user = credential.user;
      if (!user) return "Login failed";

      // 2️⃣ Get FCM token
      let fcmToken: string | null = null;
      try {
        fcmToken = await getToken(messaging);
      } catch {
        fcmToken = null;
      }

      // 3️⃣ Update Firestore
      await setDoc(
        doc(db, "Users", user.uid),
        {
          fcmToken: fcmToken,
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      return null;
    } catch (e: any) {
      if (e.code) {
        return e.message;
      }
      return `Something went wrong: ${e}`;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<string | null> {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return null;
    } catch (e: any) {
      if (e.code) {
        return e.message;
      }
      return "Something went wrong. Please try again.";
    }
  }
  async loginWithGoogle(): Promise<string | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get FCM token
      let fcmToken: string | null = null;
      try {
        fcmToken = await getToken(messaging);
      } catch {
        fcmToken = null;
      }

      const userDocRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email?.split("@")[0],
          role: "student",
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          fcmToken: fcmToken,
        });
      } else {
        // Existing user
        await setDoc(
          userDocRef,
          {
            lastLogin: serverTimestamp(),
            fcmToken: fcmToken,
          },
          { merge: true }
        );
      }

      return null;
    } catch (e: any) {
      if (e.code) {
        return e.message;
      }
      return `Google Login failed: ${e}`;
    }
  }
}

export const studentLoginBackend = new StudentLoginBackend();
export const loginStudent = studentLoginBackend.loginStudent.bind(
  studentLoginBackend
);
export const loginWithGoogle =
  studentLoginBackend.loginWithGoogle.bind(studentLoginBackend);

export const sendStudentPasswordReset =
  studentLoginBackend.sendPasswordResetEmail.bind(studentLoginBackend);
