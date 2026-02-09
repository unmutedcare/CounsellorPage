import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "firebase/firestore";

interface SignUpParams {
    email: string;
    password: string;
}

class StudentSignUpBackEnd {
    private auth = getAuth();
    private firestore = getFirestore();

    /**
     * Sign up a new student
     * SAME LOGIC AS FLUTTER
     */
    async signUpStudent({
        email,
        password,
    }: SignUpParams): Promise<string | null> {
        try {
            // 1️⃣ Create Firebase user
            const credential = await createUserWithEmailAndPassword(
                this.auth,
                email.trim(),
                password.trim()
            );

            const user = credential.user;
            const uid = user.uid;

            // 2️⃣ Send email verification with better configuration
            try {
                await sendEmailVerification(user, {
                    url: `${window.location.origin}/student/login`,
                    handleCodeInApp: false,
                });
                console.log("✅ Verification email sent successfully to:", email);
            } catch (emailError: any) {
                console.error("❌ Failed to send verification email:", emailError);
                // Don't fail the signup if email fails, but log it
            }

            // 3️⃣ Store student record in Firestore
            await setDoc(doc(this.firestore, "Users", uid), {
                uid,
                email: email.trim(),
                username: email.split("@")[0], // ✅ Default username from email
                role: "student",
                emailVerified: false,
                createdAt: serverTimestamp(),
            });

            return null; // ✅ success
        } catch (error: any) {
            console.error("❌ Signup error:", error);
            return error.message || "Something went wrong";
        }
    }
}

export default StudentSignUpBackEnd;

