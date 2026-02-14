import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

interface SaveDescriptionParams {
  sessionId: string;
  description?: string | null;
}

class ProblemDescriptionBackend {
  private db = db;

  /**
   * Save or update the problem description for a VideoCallSession
   */
  async saveDescription({
    sessionId,
    description,
  }: SaveDescriptionParams): Promise<void> {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const sessionRef = doc(this.db, "VideoCallSession", sessionId);

    await updateDoc(sessionRef, {
      description: description ?? null,
      status: description == null
        ? "emotions_selected"
        : "description_added",
      updatedAt: serverTimestamp(),
    });
  }
}

export default ProblemDescriptionBackend;
