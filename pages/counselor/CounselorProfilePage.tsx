import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Snackbar,
  TextField,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { CounsellorProfileBackend } from "../../services/CouncellorProfileBackend";
import { getAuth, signOut } from "firebase/auth";

interface CounsellorProfilePageProps {
  forceEdit?: boolean;
}

const CounsellorProfilePage: React.FC<CounsellorProfilePageProps> = ({
  forceEdit = false,
}) => {
  const navigate = useNavigate();
  const backend = new CounsellorProfileBackend();

  const [isEditing, setIsEditing] = useState<boolean>(forceEdit);
  const [initials, setInitials] = useState("CS");
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const initialsRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await backend.getProfile();
      if (profile) {
        setInitials(profile.initials ?? "");
        setMeetingLink(profile.meetingLink ?? "");
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (isEditing && initialsRef.current) {
      initialsRef.current.focus();
    }
  }, [isEditing]);

  const toggleEdit = async () => {
    if (isEditing) {
      const err = await backend.updateProfile({
        initials: initials.trim(),
        meetingLink: meetingLink.trim(),
      });

      if (err) {
        setSnackbar(err);
        return;
      }
      setSnackbar("Profile updated successfully");
    }
    setIsEditing((prev) => !prev);
  };

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
      {/* ---------- HEADER (Matches Dashboard) ---------- */}
      
        <div className="flex items-center gap-6">
          <h2 className="text-4xl font-bold text-gray-800">Counsellor Profile</h2>
        </div>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PersonIcon />}
            disabled
            sx={{
              backgroundColor: "#f0f0f0",
              color: "#2e7d32",
              fontWeight: 600,
              border: "1px solid #2e7d32",
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
      

      {/* ---------- MAIN CONTENT ---------- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 8,
          px: 2,
        }}
      >
        {loading ? (
          <CircularProgress color="success" />
        ) : (
          <Paper
            elevation={4}
            sx={{
              width: "100%",
              maxWidth: 520,
              p: 5,
              borderRadius: 4,
              border: "1px solid #e0e0e0",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography variant="h5" fontWeight="bold" color="#2c3e50">
                Account Details
              </Typography>

              <Button
                variant={isEditing ? "contained" : "outlined"}
                color="success"
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                onClick={toggleEdit}
                sx={{ borderRadius: 2 }}
              >
                {isEditing ? "Save" : "Edit"}
              </Button>
            </Box>

            {/* Initials Input */}
            <Typography variant="body2" fontWeight="bold" mb={1} color="textSecondary">
              INITIALS
            </Typography>
            <TextField
              inputRef={initialsRef}
              value={initials}
              onChange={(e) => setInitials(e.target.value)}
              disabled={!isEditing}
              fullWidth
              placeholder="e.g. JD"
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: !isEditing ? "#f9f9f9" : "transparent",
                },
              }}
            />

            {/* Meeting Link Input */}
            <Typography variant="body2" fontWeight="bold" mb={1} color="textSecondary">
              PERSONAL MEETING LINK (Zoom/Meet)
            </Typography>
            <TextField
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              disabled={!isEditing}
              fullWidth
              placeholder="https://meet.google.com/..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: !isEditing ? "#f9f9f9" : "transparent",
                },
              }}
            />
          </Paper>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar ?? ""}
      />
    </div>
  );
};

export default CounsellorProfilePage;