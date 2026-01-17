import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";


// Public Pages
import Landing from "./pages/Landing";
import RoleSelection from "./pages/RoleSelection";
import Auth from "./pages/Auth";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import SelectTiming from "./pages/student/SelectTiming";
import Payment from "./pages/student/Payment";
import EmotionSelection from "./pages/student/EmotionSelection";
import FeelingInput from "./pages/student/FeelingInput";
import MeetingPage from "./pages/student/MeetingPage";
import MySessions from "./pages/student/MySessions";

// Counselor Pages
import CounselorDashboard from "./pages/counselor/Dashboard";
import CompletedCases from "./pages/counselor/CompletedCases";
import CounsellorProfilePage from "./pages/counselor/CounselorProfilePage";
import CounsellorSetTimingPage from "./pages/counselor/SetTimings";
import UpcomingCases from "./pages/counselor/upcoming";


const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/role-select" element={<RoleSelection />} />
            <Route path="/auth" element={<Auth />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/select-timing"
              element={
                <ProtectedRoute role="student">
                  <SelectTiming />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/payment"
              element={
                <ProtectedRoute role="student">
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/emotion-selection"
              element={
                <ProtectedRoute role="student">
                  <EmotionSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/feeling-input"
              element={
                <ProtectedRoute role="student">
                  <FeelingInput />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/meeting"
              element={
                <ProtectedRoute role="student">
                  <MeetingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-sessions"
              element={
                <ProtectedRoute role="student">
                  <MySessions />
                </ProtectedRoute>
              }
            />

            {/* Counselor Protected Routes */}
            <Route
              path="/counselor/dashboard"
              element={
                <ProtectedRoute role="counsellor">
                  <CounselorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
  path="/counsellor/completed-cases"
  element={
    <ProtectedRoute role="counsellor">
      <CompletedCases />
    </ProtectedRoute>
  }
/>
<Route
path="/counsellor/upcoming-cases"
element={
  <ProtectedRoute role="counsellor">
    <UpcomingCases />
  </ProtectedRoute>
}
/>



           

            {/* Counsellor Profile (REPLACED shared profile) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute role="counsellor">
                  <CounsellorProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
  path="/counselor/set-timing"
  element={
    <ProtectedRoute role="counsellor">
      <CounsellorSetTimingPage />
    </ProtectedRoute>
  }
/>


          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
