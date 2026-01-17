import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  CircularProgress, 
  IconButton, 
  Typography 
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getAuth, signOut } from "firebase/auth";

import {
  getCompletedCases,
  CompletedCase,
} from "../../services/completedCasesBackend";

const CompletedCases: React.FC = () => {
  const [cases, setCases] = useState<CompletedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getCompletedCases()
      .then(setCases)
      .catch(() => setError("Failed to load completed cases"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-full min-h-screen px-15 py-7">
      {/* ---------- HEADER (Matches Dashboard & Profile) ---------- */}
      <div className="px-15 py-6 flex justify-between items-center  shadow-sm">
        <div className="flex items-center gap-5">
          <h2 className="text-4xl font-bold text-gray-800 mr-6">Completed Cases</h2>
        </div>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PersonIcon />}
            onClick={() => navigate("/profile")}
            sx={{
              backgroundColor: "#fff",
              color: "#2e7d32",
              fontWeight: 600,
              border: "1px solid #2e7d32",
              "&:hover": { backgroundColor: "#f0f0f0" },
            }}
          >
            Profile
          </Button>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              backgroundColor: "#ff6b6b",
              color: "#fff",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#ff5252" },
            }}
          >
            Logout
          </Button>
        </Box>
      </div>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="p-10 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress color="success" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No completed cases found in your records.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cases.map((c) => (
              <CompletedCaseCard
                key={c.sessionId}
                caseData={c}
                // If you have a detail view, navigate here
                onClick={() => console.log("Case clicked", c.sessionId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------
   Completed Case Card Component
--------------------------------------------- */

interface CardProps {
  caseData: CompletedCase;
  onClick: () => void;
}

const CompletedCaseCard: React.FC<CardProps> = ({ caseData, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all 
                 border border-gray-100 flex items-start gap-5 group cursor-pointer"
    >
      {/* Status Icon */}
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center transition-colors group-hover:bg-green-600">
        <CheckCircleIcon className="text-green-600 group-hover:text-white" />
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <Typography variant="h6" fontWeight="bold" className="text-gray-800">
            {caseData.studentName}
          </Typography>
          <span className="text-xs font-bold uppercase tracking-wider bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
            Completed
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <p><strong>Date:</strong> {caseData.date}</p>
          <p><strong>Session ID:</strong> #{caseData.sessionId.slice(-6)}</p>
        </div>

        {caseData.description && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-200">
            <p className="text-gray-700 text-sm leading-relaxed italic">
              "{caseData.description}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedCases;