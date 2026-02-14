import {
  doc,
  getDoc,
  updateDoc,
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
  }): Promise<string | null> {
    try {
      const user = this.auth.currentUser;
      if (!user) return "User not logged in.";

      const { initials, meetingLink } = params;

      if (initials.trim().length ===0) {
        return "Initials cannot be empty.";
      }

      if (!meetingLink.startsWith("http")) {
        return "Please enter a valid meeting link.";
      }

      const ref = doc(this.firestore, "Counsellors", user.uid);

      await updateDoc(ref, {
        initials: initials.trim(),
        meetingLink: meetingLink.trim(),
        updatedAt: Timestamp.now(),
      });

      return null;
    } catch (e: any) {
      return `Failed to update profile: ${e}`;
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
