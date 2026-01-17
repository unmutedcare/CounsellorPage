import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { fetchCounsellorSessions } from "../../services/counsellorSessionService";
import { getAuth, signOut } from "firebase/auth";

const CounselorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCounsellorSessions();
      setSessions(data);
      setLoading(false);
    };
    load();
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
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold mr-7">Counsellor Dashboard</h2>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Button
            variant="contained"
            startIcon={<PersonIcon />}
            onClick={() => navigate("/profile")}
            sx={{
              backgroundColor: "#fff",
              color: "#2e7d32",
              fontWeight: 600,
              boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
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
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Set Availability Card */}
        <div
          onClick={() => navigate("/counselor/set-timing")}
          className="cursor-pointer bg-white rounded-2xl shadow-lg p-6
                     hover:shadow-xl transition-all border border-green-200 flex items-center gap-5"
        >
          <div className="bg-green-100 p-3 rounded-full">
            <CalendarMonthIcon className="text-green-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-700">Set Your Availability</h3>
            <p className="text-gray-600 text-sm">Choose dates and add up to 3 sessions per day.</p>
          </div>
        </div>

        {/* Upcoming Cases Card */}
        <div
          onClick={() => navigate("/counsellor/upcoming-cases")}
          className="cursor-pointer bg-white rounded-2xl shadow-lg p-6
                     hover:shadow-xl transition-all border border-blue-200 flex items-center gap-5"
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <AssignmentIcon className="text-blue-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-700">Upcoming Cases</h3>
            <p className="text-gray-600 text-sm">View and manage your scheduled student sessions.</p>
          </div>
        </div>

        {/* Completed Cases Card */}
        <div
          onClick={() => navigate("/counsellor/completed-cases")}
          className="cursor-pointer bg-white rounded-2xl shadow-lg p-6
                     hover:shadow-xl transition-all border border-purple-200 flex items-center gap-5"
        >
          <div className="bg-purple-100 p-3 rounded-full">
            <DoneAllIcon className="text-purple-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-700">Completed Cases</h3>
            <p className="text-gray-600 text-sm">Review history and notes from past sessions.</p>
          </div>
        </div>

        {/* ---------- SESSIONS LIST ---------- */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-8">My Sessions</h2>

          {loading ? (
            <div className="flex justify-center"><CircularProgress size={30} /></div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-gray-500 bg-white p-6 rounded-xl border border-dashed">No sessions yet</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div key={s.id} className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500 flex justify-between items-center">
                  <div>
                    <p className="font-bold">Student: {s.studentId}</p>
                    <p className="text-sm text-gray-600">{s.date} | {s.time}</p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-xs font-bold rounded-full uppercase tracking-wider text-gray-500">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;