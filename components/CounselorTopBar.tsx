import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { getAuth, signOut } from "firebase/auth";

const CounselorTopBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate("/auth");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#2e7d32" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Counselor Dashboard
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PersonIcon />}
            onClick={() => navigate("/counselor/profile")}
            sx={{
              backgroundColor: "#fff",
              color: "#2e7d32",
              fontWeight: 600,
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
      </Toolbar>
    </AppBar>
  );
};

export default CounselorTopBar;
