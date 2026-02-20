import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { useApp } from "../../context/AppContext";
import { Mail, Lock, Sparkles, LogIn, UserPlus } from "lucide-react";
import logo from "@/src/assets/unmutedlogo.webp";

const CounsellorLogin: React.FC = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, setRole } = useApp();

    const handleSignup = async () => {
        try {
            setLoading(true);
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            await setDoc(doc(db, "Users", user.uid), {
                uid: user.uid,
                email: email.trim(),
                username: email.split('@')[0], // Default username
                role: "COUNSELOR",
                createdAt: serverTimestamp(),
            });

            await setDoc(doc(db, "Counsellors", user.uid), {
                uid: user.uid,
                email: email.trim(),
                username: email.split('@')[0], // Keep consistent
                createdAt: serverTimestamp(),
            });

            setRole("COUNSELOR");
            login();
            // Wait for state to propagate
            setTimeout(() => {
                navigate("/counsellor/dashboard", { replace: true });
            }, 500);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const credential = await signInWithEmailAndPassword(auth, email, password);

            const userDoc = await getDoc(doc(db, "Users", credential.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const rawRole = (userData.role || "").toUpperCase();
                if (rawRole === "COUNSELOR" || rawRole === "COUNSELLOR") {
                    setRole("COUNSELOR");
                }
            } else {
                setRole("COUNSELOR");
            }

            login();
            // Wait for state to propagate
            setTimeout(() => {
                navigate("/counsellor/dashboard", { replace: true });
            }, 500);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-brand-secondary opacity-10 blur-[150px] rounded-full" />
            
            <div className="relative z-10 w-full max-w-[480px] reveal">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                   <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                     <img src={logo} alt="Unmuted Logo" className="w-full h-full object-cover" />
                   </div>
                </div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
                        <Sparkles size={14} className="text-brand-secondary" />
                        <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Counselor Portal</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white tracking-tighter mb-3">
                        {isSignup ? "Create" : "Counselor"} <span className="text-gradient italic">Login</span>
                    </h1>
                    <p className="text-white/40 font-light tracking-wide">Access the portal to provide guidance.</p>
                </div>

                <div className="glass-panel p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-12 h-12 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-secondary transition-colors" size={18} />
                                <input
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-secondary/50 focus:bg-white/[0.05] transition-all"
                                    placeholder="counselor@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Account Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-secondary transition-colors" size={18} />
                                <input
                                    type="password"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-secondary/50 focus:bg-white/[0.05] transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={isSignup ? handleSignup : handleLogin}
                            className="btn-action w-full py-4 text-lg mt-4 shadow-lg shadow-brand-secondary/20 bg-brand-secondary flex items-center justify-center gap-3"
                        >
                            {isSignup ? <UserPlus size={20} /> : <LogIn size={20} />}
                            <span>{isSignup ? "Create Account" : "Access Portal"}</span>
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-white/40 text-sm font-light">
                                {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
                                <span
                                    className="text-white font-semibold underline cursor-pointer hover:text-brand-secondary transition-colors underline-offset-4 ml-1"
                                    onClick={() => setIsSignup(!isSignup)}
                                >
                                    {isSignup ? "Log In" : "Sign Up"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 text-white/10 font-luxury text-[10px] tracking-[1em] uppercase">
                Counselor • Excellence • Support
            </div>
        </div>
    );
};

export default CounsellorLogin;
