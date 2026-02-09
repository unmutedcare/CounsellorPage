import React from "react";
import { useNavigate } from "react-router-dom";

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-300 to-yellow-200">
            <div className="bg-white/80 p-8 rounded-2xl w-full max-w-md shadow-xl text-center">
                <h2 className="text-2xl font-bold text-green-700 mb-4">
                    Verify Your Email
                </h2>
                <p className="text-gray-700 mb-6">
                    A verification link has been sent to your email address. Please check your inbox and click the link to verify your account before logging in.
                </p>
                <button
                    onClick={() => navigate("/student/login")}
                    className="w-full py-3 rounded-full bg-green-700 text-white font-bold hover:bg-green-800 transition"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;
