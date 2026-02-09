import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

/* 🔒 BACKEND IMPORTS — DO NOT CHANGE */
import { loginStudent, loginWithGoogle } from "../../services/Student_Login_BackEnd";
import { useApp } from "../../context/AppContext";


const StudentLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const auth = getAuth();
  const { login, setRole } = useApp();

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

    if (!auth.currentUser) {
      alert("Login failed: user not found");
      setLoading(false);
      return;
    }

    // 🚨 ENFORCE EMAIL VERIFICATION
    if (!auth.currentUser.emailVerified) {
      alert("Please verify your email before logging in. Check your inbox.");
      await auth.signOut(); // 🔒 Prevent access
      setLoading(false);
      return;
    }

    login();
    setRole("STUDENT");
    // await initNotifications(); // Commented out as it causes linter errors if not imported/defined
    // await checkTermsAndRedirect(navigate); // Replaced with direct navigation
    navigate("/student/dashboard");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    const result = await loginWithGoogle();

    if (result) {
      alert(result);
      setLoading(false);
      return;
    }

    login();
    setRole("STUDENT");
    navigate("/student/dashboard");
    setLoading(false);
  };

  return (
    <>
      {/* 🔹 INLINE CSS */}
      <style>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #a5d6a7, #efebe9);
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card {
          background: rgba(255, 255, 255, 0.9);
          padding: 30px;
          width: 100%;
          max-width: 420px;
          border-radius: 24px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #2e7d32;
        }

        .input {
          width: 100%;
          padding: 12px;
          margin-bottom: 16px;
          border-radius: 12px;
          border: 1px solid #ccc;
          background: #e8f5e9;
          font-size: 16px;
        }

        .password-wrapper {
          position: relative;
        }

        .toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #666;
        }

        .link {
          text-align: right;
          color: #c62828;
          cursor: pointer;
          font-size: 14px;
        }

        button {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 10px;
        }

        .login-btn {
          background: #2e7d32;
          color: white;
        }

        .google-btn {
          background: #8d6e63;
          color: white;
        }

        .signup {
          margin-top: 14px;
          text-align: center;
          color: #1b5e20;
          cursor: pointer;
        }

        .loader {
          text-align: center;
          margin-bottom: 12px;
        }
      `}</style>

      {/* 🔹 UI */}
      <div className="login-container">
        <div className="card">
          <h2>Student Login</h2>

          {loading && <div className="loader">⏳ Please wait...</div>}

          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <div
            className="link"
            onClick={() => navigate("/student-forgot-password")}
          >
            Forgot Password?
          </div>

          <button className="login-btn" onClick={handleLogin}>
            Login
          </button>

          <button className="google-btn" onClick={handleGoogleLogin}>
            Login with Google
          </button>

          <div
            className="signup"
            onClick={() => navigate("/student/signup")}
          >
            Don't have an account? Sign Up
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentLogin;
