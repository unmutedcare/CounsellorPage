import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSignUpBackEnd from "../../services/Student_SignUp_BackEnd";
import { Mail, Lock, Sparkles, UserPlus, User } from "lucide-react";
import { useApp } from "../../context/AppContext";

const StudentSignup: React.FC = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useApp();
    const backend = new StudentSignUpBackEnd();

    const handleSignup = async () => {
        if (!email || !username || !password || !confirmPassword) {
            alert("Please fill all required fields");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        const result = await backend.signUpStudent({
            email,
            username,
            password,
        });

        setLoading(false);

        if (result) {
            alert(result);
            return;
        }

        navigate("/verify-email", { replace: true });
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-brand-primary opacity-10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-brand-secondary opacity-10 blur-[150px] rounded-full" />
            
            <div className="relative z-10 w-full max-w-[540px] reveal">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                   <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                     <img src="/unmutedlogo.webp" alt="Unmuted Logo" className="w-full h-full object-cover" />
                   </div>
                </div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
                        <Sparkles size={14} className="text-brand-primary" />
                        <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">New Account</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white tracking-tighter mb-3">Begin your <span className="text-gradient italic">Journey</span></h1>
                    <p className="text-white/40 font-light tracking-wide">Join our community for expert support.</p>
                </div>

                <div className="glass-panel p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-luxury tracking-[0.3em] text-white">Creating Account...</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="email"
                                    placeholder="name@email.com"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Choose Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Your unique name"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Set Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-primary transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            className="btn-action w-full py-4 text-lg mt-4 shadow-lg shadow-brand-primary/20"
                            onClick={handleSignup}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <UserPlus size={20} />
                                <span>Create Account</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <p className="text-white/40 font-light">
                        Already have an account?{" "}
                        <button 
                            onClick={() => navigate("/student/login")}
                            className="text-white font-semibold hover:text-brand-primary transition-colors underline underline-offset-4"
                        >
                            Log In
                        </button>
                    </p>
                </div>
            </div>

            <div className="absolute bottom-8 text-white/10 font-luxury text-[10px] tracking-[1em] uppercase">
                Privacy • Security • Confidentiality
            </div>
        </div>
    );
};

export default StudentSignup;
