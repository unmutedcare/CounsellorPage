import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";
import {
    doc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";
import { Mail, Lock, User, Sparkles, LogIn, UserPlus } from "lucide-react";
import logo from "@/src/assets/unmutedlogo.webp";

const StudentSignup: React.FC = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSignup = async () => {
        if (!email || !username || !password) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            // Send Verification
            await sendEmailVerification(user);

            // Create User Doc
            await setDoc(doc(db, "Users", user.uid), {
                uid: user.uid,
                email: email.trim(),
                username: username.trim(),
                role: "student",
                emailVerified: false,
                createdAt: serverTimestamp(),
            });

            alert("Signup successful! Please check your email for verification.");
            navigate("/verify-email");
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-brand-primary opacity-10 blur-[150px] rounded-full" />
            
            <div className="relative z-10 w-full max-w-[540px] reveal">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                   <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                     <img src={logo} alt="Unmuted Logo" className="w-full h-full object-cover" />
                   </div>
                </div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
                        <Sparkles size={14} className="text-brand-primary" />
                        <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Join the Network</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white tracking-tighter mb-3">Create <span className="text-gradient italic">Account</span></h1>
                    <p className="text-white/40 font-light tracking-wide">Start your journey towards mental well-being.</p>
                </div>

                <div className="glass-panel p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Preferred Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                                    placeholder="yourname"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                                    placeholder="name@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Account Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSignup}
                            className="btn-action w-full py-4 text-lg mt-4 shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-3"
                        >
                            <UserPlus size={20} />
                            <span>Create Account</span>
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-white/40 text-sm font-light">
                                Already have an account?{" "}
                                <span
                                    className="text-white font-semibold underline cursor-pointer hover:text-brand-primary transition-colors underline-offset-4 ml-1"
                                    onClick={() => navigate("/student/login")}
                                >
                                    Log In
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 text-white/10 font-luxury text-[10px] tracking-[1em] uppercase">
                Privacy • Security • Confidentiality
            </div>
        </div>
    );
};

export default StudentSignup;
