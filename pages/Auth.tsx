import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Button from "../components/Button";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import "./Auth.css";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { role, login } = useApp();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ================= SIGN UP =================
  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!role) {
      alert("Please select Student or Counsellor first");
      return;
    }

    const normalizedRole = role.toLowerCase();

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const collectionName =
        normalizedRole === "counselor" ? "Counsellors" : "Users";

      await setDoc(doc(db, collectionName, user.uid), {
        fullName: name,
        email,
        role: normalizedRole,
        createdAt: serverTimestamp(),
      });

      login(normalizedRole);

      navigate(
        normalizedRole === "counselor"
          ? "/counselor/dashboard"
          : "/student/dashboard"
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const counsellorSnap = await getDoc(doc(db, "Counsellors", user.uid));
      if (counsellorSnap.exists()) {
        login("counselor");
        navigate("/counselor/dashboard");
        return;
      }

      const userSnap = await getDoc(doc(db, "Users", user.uid));
      if (userSnap.exists()) {
        login("student");
        navigate("/student/dashboard");
        return;
      }

      alert("User role not found in database");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Log In" : "Sign Up"}</h2>

        {!isLogin && (
          <div className="input">
            <User />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="input">
          <Mail />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <Lock />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff /> : <Eye />}
          </span>
        </div>

        {!isLogin && (
          <div className="input">
            <Lock />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

        <Button
  onClick={isLogin ? handleLogin : handleSignup}
  disabled={loading}
>
  {loading ? "Submitting..." : "Submit"}
</Button>


        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin((prev) => !prev)}>
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
