import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db as firestore } from "../firebase/firebase";

export class CounsellorProfileBackend {
  private firestore = firestore;
  private auth = auth;

  /**
   * Save initials + meeting link to Firestore
   * Mirrors Flutter implementation exactly
   */
  async updateProfile(params: {
    initials: string;
    meetingLink: string;
    username?: string; // Add optional username
  }): Promise<string | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return "User not logged in.";

      const { initials, meetingLink, username } = params;

      if (initials.trim().length === 0) {
        return "Initials cannot be empty.";
      }

      if (!meetingLink.startsWith("http")) {
        return "Please enter a valid meeting link.";
      }

      const counsellorRef = doc(this.firestore, "Counsellors", user.uid);
      const userRef = doc(this.firestore, "Users", user.uid);

      // Use setDoc with merge: true to avoid "No document to update" errors
      await setDoc(counsellorRef, {
        initials: initials.trim(),
        meetingLink: meetingLink.trim(),
        updatedAt: Timestamp.now(),
      }, { merge: true });

      // Update Users collection for the name (if provided)
      if (username && username.trim().length > 0) {
        await setDoc(userRef, {
          username: username.trim(),
          updatedAt: Timestamp.now(),
        }, { merge: true });
      }

      return null;
    } catch (e: any) {
      // If document doesn't exist, provide a more helpful error or handle it
      if (e.code === 'not-found') {
        return "Profile document not found. Please try logging out and in again.";
      }
      return `Failed to update profile: ${e.message || e}`;
    }
  }

  /**
   * Check if counsellor has completed FTUE
   * Fail-safe matches Flutter logic
   */
  async isFTUEComplete(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      if (!profile) return false;

      const initials = profile.initials;
      const meetingLink = profile.meetingLink;

      return (
        initials != null &&
        initials.toString().trim().length > 0 &&
        meetingLink != null &&
        meetingLink.toString().trim().length > 0
      );
    } catch {
      // 🔥 Fail-safe: never block counsellor
      return true;
    }
  }

  /**
   * Fetch profile details for the current counsellor
   */
  async getProfile(): Promise<Record<string, any> | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return null;

      const ref = doc(this.firestore, "Counsellors", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) return null;

      return snap.data();
    } catch {
      return null;
    }
  }
}
