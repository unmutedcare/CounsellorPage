import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { getAuth, signOut } from "firebase/auth";

import {
  fetchUpcomingCases,
  markSessionCompleted,
} from "../../services/counsellorUpcomingCasesService.ts";

const UpcomingCases: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchUpcomingCases();
      setCases(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/role-select");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    await markSessionCompleted(id);
    setCases((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="w-full min-h-screen px-17 py-7">
      {/* ---------- HEADER ---------- */}
      <div className="px-15 py-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-bold text-gray-800 mr-5">Upcoming Cases</h2>
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
      <div className="p-10 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress color="success" />
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No upcoming sessions scheduled.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Typography variant="h6" fontWeight="bold">
                      Student: {c.student}
                    </Typography>
                    <p className="text-gray-600 text-sm">
                      {c.date} • {c.time}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase">
                    {c.status}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<VideoCallIcon />}
                    href={c.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ borderRadius: "10px", flex: 1 }}
                  >
                    Join Now
                  </Button>

                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<TaskAltIcon />}
                    onClick={() => handleMarkCompleted(c.id)}
                    sx={{ borderRadius: "10px", flex: 1 }}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingCases;