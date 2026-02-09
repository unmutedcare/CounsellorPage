import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import { auth } from "../../firebase/firebase";
import { useApp } from "../../context/AppContext";

const CounsellorLogin: React.FC = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const { login, setRole } = useApp();
    const db = getFirestore();

    const handleSignup = async () => {
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            // 1️⃣ Create User Doc (for AppContext role check)
            await setDoc(doc(db, "Users", user.uid), {
                uid: user.uid,
                email: email.trim(),
                role: "counsellor", // Lowercase to match student pattern, AppContext handles upper
                createdAt: serverTimestamp(),
            });

            // 2️⃣ Create Counsellor profile (for profile management)
            await setDoc(doc(db, "Counsellors", user.uid), {
                uid: user.uid,
                email: email.trim(),
                createdAt: serverTimestamp(),
            });

            login();
            setRole("COUNSELOR");
            navigate("/counsellor/dashboard", { replace: true });
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Signup failed");
        }
    };

    const handleLogin = async () => {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);

            // 🔍 Fetch role to ensure consistency
            const userDoc = await getDoc(doc(db, "Users", credential.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === "counsellor" || userData.role === "COUNSELOR") {
                    setRole("COUNSELOR");
                }
            } else {
                // Determine if this is legacy user lacking docs? 
                // For now, assume if they are logging in here, they are a counsellor. 
                // But safer to rely on AppContext eventual consistency.
                setRole("COUNSELOR");
            }

            login();
            navigate("/counsellor/dashboard", { replace: true });
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-blue-300 to-purple-200 flex items-center justify-center">
            <div className="bg-white/40 backdrop-blur-md p-8 rounded-2xl w-full max-w-sm shadow-xl space-y-5">
                <h2 className="text-2xl font-bold text-center text-[#2d4026]">
                    {isSignup ? "Counsellor Sign Up" : "Counsellor Log In"}
                </h2>

                <input
                    className="w-full p-3 rounded-xl outline-none border border-white/60 bg-white/70"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full p-3 rounded-xl outline-none border border-white/60 bg-white/70"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={isSignup ? handleSignup : handleLogin}
                    className="w-full py-3 rounded-full bg-[#2e7d32] text-white font-bold hover:bg-[#1b5e20] transition"
                >
                    {isSignup ? "Sign Up" : "Log In"}
                </button>

                <p className="text-center text-sm text-[#2d4026]">
                    {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
                    <span
                        className="font-semibold underline cursor-pointer"
                        onClick={() => setIsSignup(!isSignup)}
                    >
                        {isSignup ? "Log In" : "Sign Up"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default CounsellorLogin;
