import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";

/* 🔒 BACKEND IMPORTS — DO NOT CHANGE */
import { 
  loginStudent, 
  loginWithGoogle, 
  loginWithGoogleRedirect, 
  handleGoogleRedirectResult 
} from "../../services/Student_Login_BackEnd";
import { useApp } from "../../context/AppContext";
import { Mail, Lock, Eye, EyeOff, Chrome, Sparkles } from "lucide-react";
import logo from "@/src/assets/unmutedlogo.webp";


const StudentLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login, setRole } = useApp();

  // Handle Redirect Result on Mount
  React.useEffect(() => {
    const checkRedirect = async () => {
      const result = await handleGoogleRedirectResult();
      if (result === "SUCCESS") {
        login();
        setRole("STUDENT");
        navigate("/student/dashboard");
      } else if (result) {
        alert(result);
      }
    };
    checkRedirect();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    setLoading(true);

    const result = await loginStudent({
      email,
      password,
    });

    if (result) {
      alert(result);
      setLoading(false);
      return;
    }

    if (!auth?.currentUser) {
      alert("Login failed: user not found");
      setLoading(false);
      return;
    }

    // 🚨 ENFORCE EMAIL VERIFICATION
    if (!auth?.currentUser?.emailVerified) {
      alert("Please verify your email before logging in. Check your inbox.");
      await auth?.signOut();
      setLoading(false);
      return;
    }

    login();
    setRole("STUDENT");
    setTimeout(() => {
      navigate("/student/dashboard");
    }, 500);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Switching to Redirect flow...");
        loginWithGoogleRedirect();
      }
    }, 10000);

    try {
      const result = await loginWithGoogle();
      clearTimeout(timeout);

      if (result) {
        alert(result);
        setLoading(false);
        return;
      }

      login();
      setRole("STUDENT");
      navigate("/student/dashboard");
    } catch (e) {
      clearTimeout(timeout);
      console.error("Google Login Error:", e);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-brand-primary opacity-10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] bg-brand-secondary opacity-10 blur-[150px] rounded-full" />
      
      <div className="relative z-10 w-full max-w-[480px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
           <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/20 shadow-xl">
             <img src={logo} alt="Unmuted Logo" className="w-full h-full object-cover" />
           </div>
        </div>

        {/* Entrance Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
            <Sparkles size={14} className="text-brand-primary" />
            <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Student Portal</span>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tighter mb-3">Welcome <span className="text-gradient italic">Back</span></h1>
          <p className="text-white/40 font-light tracking-wide">Enter your credentials to continue.</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-luxury tracking-[0.3em] text-white">Authenticating...</span>
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
              <label className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/50 ml-1">Account Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => navigate("/student-forgot-password")}
                  className="text-[11px] text-brand-primary hover:text-brand-primary/80 transition-colors font-medium uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button 
              className="btn-action w-full py-4 text-lg mt-4 shadow-lg shadow-brand-primary/20"
              onClick={handleLogin}
            >
              Log In
            </button>

            <div className="relative py-4 flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[10px] font-luxury text-white/30 tracking-widest uppercase">or continue with</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <button 
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-medium"
              onClick={handleGoogleLogin}
            >
              <Chrome size={18} className="text-brand-secondary" />
              Google Authentication
            </button>
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-white/40 font-light">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate("/student/signup")}
              className="text-white font-semibold hover:text-brand-primary transition-colors underline underline-offset-4"
            >
              Sign Up Now
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

export default StudentLogin;
