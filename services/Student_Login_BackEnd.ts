import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { getMessaging, getToken } from "firebase/messaging";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";

class StudentLoginBackend {
  private getMessagingSafely() {
    try {
      return getMessaging();
    } catch {
      return null;
    }
  }

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
        const messaging = this.getMessagingSafely();
        if (messaging) fcmToken = await getToken(messaging);
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

  async processUserDoc(user: any): Promise<void> {
    console.log("👤 Processing User Doc for:", user.uid);
    
    // Get FCM token
    let fcmToken: string | null = null;
    try {
      console.log("🔔 Attempting to fetch FCM token...");
      const messaging = this.getMessagingSafely();
      if (messaging) {
        // Wrap getToken in a timeout because it's known to hang
        fcmToken = await Promise.race([
          getToken(messaging),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("FCM Timeout")), 5000))
        ]).catch(err => {
          console.warn("⚠️ FCM Token fetch failed or timed out:", err.message);
          return null;
        }) as string | null;
      }
    } catch (err: any) {
      console.warn("⚠️ FCM Token error:", err.message);
      fcmToken = null;
    }

    console.log("📄 Fetching user document from Firestore...");
    const userDocRef = doc(db, "Users", user.uid);
    const userDoc = await getDoc(userDocRef);
    console.log("📄 Firestore GetDoc finished. Exists:", userDoc.exists());

    if (!userDoc.exists()) {
      console.log("✨ Creating new user document...");
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
      console.log("🔄 Updating existing user document...");
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
    console.log("✅ processUserDoc complete.");
  }

  async loginWithGoogle(): Promise<string | null> {
    try {
      console.log("🚀 Starting Google Login Popup...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Google Sign-In Successful, User:", result.user.uid);
      
      await this.processUserDoc(result.user);
      console.log("🏁 loginWithGoogle function finished successfully.");
      return null;
    } catch (e: any) {
      console.error("❌ loginWithGoogle failed:", e);
      if (e.code) {
        return e.message;
      }
      return `Google Login failed: ${e}`;
    }
  }

  async loginWithGoogleRedirect(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  }

  async handleRedirectResult(): Promise<string | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log("✅ Redirect Result Found, User:", result.user.uid);
        await this.processUserDoc(result.user);
        return "SUCCESS";
      }
      return null;
    } catch (e: any) {
      return e.message;
    }
  }
}

export const studentLoginBackend = new StudentLoginBackend();
export const loginStudent = studentLoginBackend.loginStudent.bind(
  studentLoginBackend
);
export const loginWithGoogle =
  studentLoginBackend.loginWithGoogle.bind(studentLoginBackend);

export const loginWithGoogleRedirect =
  studentLoginBackend.loginWithGoogleRedirect.bind(studentLoginBackend);

export const handleGoogleRedirectResult =
  studentLoginBackend.handleRedirectResult.bind(studentLoginBackend);

export const sendStudentPasswordReset =
  studentLoginBackend.sendPasswordResetEmail.bind(studentLoginBackend);
