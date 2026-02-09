import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSignUpBackEnd from "../../services/Student_SignUp_BackEnd";

const StudentSignup: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const backend = new StudentSignUpBackEnd();

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            alert("Please fill all fields");
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
            password,
        });

        setLoading(false);

        if (result) {
            alert(result);
            return;
        }

        // ✅ SAME AS Flutter: go to verify email page
        navigate("/verify-email", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-300 to-yellow-200">
            <div className="bg-white/80 p-8 rounded-2xl w-full max-w-md shadow-xl">
                <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
                    Create Account
                </h2>

                <input
                    className="w-full p-3 mb-4 rounded-xl border"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="w-full p-3 mb-4 rounded-xl border"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    className="w-full p-3 mb-6 rounded-xl border"
                    placeholder="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full py-3 rounded-full bg-green-700 text-white font-bold hover:bg-green-800 transition"
                >
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p
                    className="mt-4 text-center text-green-700 cursor-pointer"
                    onClick={() => navigate("/student/login")}
                >
                    Already have an account? Log In
                </p>
            </div>
        </div>
    );
};

export default StudentSignup;

