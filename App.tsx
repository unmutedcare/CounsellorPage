import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import RoleSelection from "./pages/RoleSelection";



import EmotionSelection from "./pages/student/EmotionSelection";
import FeelingInput from "./pages/student/FeelingInput";
import ProblemDescriptionPage from "./pages/student/Problem_desc";
import CalendarPage from "./pages/student/Calender";
import StudentLogin from "./pages/student/StudentLogin";
import StudentSignup from "./pages/student/StudentSignup";
import VerifyEmail from "./pages/VerifyEmail";
import StudentDashboard from "./pages/student/Dashboard";
import Paymentpage from "./pages/student/Paymentpage";
import CountdownPage from "./pages/student/CountdownPage";

import CounsellorLogin from "./pages/counselor/CounsellorLogin";
import CounsellorDashboard from "./pages/counselor/Dashboard";
import CounsellorProfilePage from "./pages/counselor/CounselorProfilePage";
import SetTimings from "./pages/counselor/SetTimings";
import UpcomingCases from "./pages/counselor/upcoming";
import CompletedCases from "./pages/counselor/CompletedCases";

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/role-select" element={<RoleSelection />} />

          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/counsellor/login" element={<CounsellorLogin />} />

          {/* PROTECTED */}
          <Route element={<Layout />}>
            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="STUDENT">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/emotion-selection"
              element={
                <ProtectedRoute role="STUDENT">
                  <EmotionSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/feeling-input"
              element={
                <ProtectedRoute role="STUDENT">
                  <FeelingInput />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/problem-description"
              element={
                <ProtectedRoute role="STUDENT">
                  <ProblemDescriptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/calendar"
              element={
                <ProtectedRoute role="STUDENT">
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/payment"
              element={
                <ProtectedRoute role="STUDENT">
                  <Paymentpage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/countdown"
              element={
                <ProtectedRoute role="STUDENT">
                  <CountdownPage />
                </ProtectedRoute>
              }
            />

            {/* Counsellor Routes */}
            <Route
              path="/counsellor/dashboard"
              element={
                <ProtectedRoute role="COUNSELOR">
                  <CounsellorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/counsellor/profile"
              element={
                <ProtectedRoute role="COUNSELOR">
                  <CounsellorProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/counsellor/set-timing"
              element={
                <ProtectedRoute role="COUNSELOR">
                  <SetTimings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/counsellor/upcoming-cases"
              element={
                <ProtectedRoute role="COUNSELOR">
                  <UpcomingCases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/counsellor/completed-cases"
              element={
                <ProtectedRoute role="COUNSELOR">
                  <CompletedCases />
                </ProtectedRoute>
              }
            />
          </Route>

        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
