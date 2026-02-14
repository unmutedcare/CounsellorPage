import {
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";
import {
    doc,
    setDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";
import { auth, db as firestore } from "../firebase/firebase";

interface SignUpParams {
    email: string;
    username: string;
    password: string;
}

class StudentSignUpBackEnd {
    private auth = auth;
    private firestore = firestore;

    /**
     * Check if a username is already taken
     */
    async isUsernameTaken(username: string): Promise<boolean> {
        const q = query(collection(this.firestore, "Users"), where("username", "==", username));
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    }

    /**
     * Sign up a new student
     */
    async signUpStudent({
        email,
        username,
        password,
    }: SignUpParams): Promise<string | null> {
        try {
            // 0️⃣ Check username uniqueness
            if (await this.isUsernameTaken(username)) {
                return "Username already taken";
            }

            // 1️⃣ Create Firebase user
            const credential = await createUserWithEmailAndPassword(
                this.auth,
                email.trim(),
                password.trim()
            );

            const user = credential.user;
            const uid = user.uid;

            // 2️⃣ Send email verification
            try {
                await sendEmailVerification(user, {
                    url: `${window.location.origin}/student/login`,
                    handleCodeInApp: false,
                });
                console.log("✅ Verification email sent successfully to:", email);
            } catch (emailError: any) {
                console.error("❌ Failed to send verification email:", emailError);
            }

            // 3️⃣ Store student record in Firestore
            await setDoc(doc(this.firestore, "Users", uid), {
                uid,
                email: email.trim(),
                username: username.trim(),
                role: "student",
                emailVerified: false,
                createdAt: serverTimestamp(),
            });

            return null; // ✅ success
        } catch (error: any) {
            console.error("❌ Signup error:", error);
            if (error.code === 'auth/email-already-in-use') {
                return "Email already in use";
            }
            return error.message || "Something went wrong";
        }
    }
}

export default StudentSignUpBackEnd;
