import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-6">
      <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
      <div className="text-[10px] font-luxury tracking-[0.4em] text-white/20 uppercase animate-pulse">Syncing Portal...</div>
    </div>
  </div>
);

// Lazy Loaded Pages
const Landing = lazy(() => import("./pages/Landing"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const Profile = lazy(() => import("./pages/Profile"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

// Student Pages
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const EmotionSelection = lazy(() => import("./pages/student/EmotionSelection"));
const FeelingInput = lazy(() => import("./pages/student/FeelingInput"));
const ProblemDescriptionPage = lazy(() => import("./pages/student/Problem_desc"));
const CalendarPage = lazy(() => import("./pages/student/Calender"));
const StudentLogin = lazy(() => import("./pages/student/StudentLogin"));
const StudentSignup = lazy(() => import("./pages/student/StudentSignup"));
const Paymentpage = lazy(() => import("./pages/student/Paymentpage"));
const CountdownPage = lazy(() => import("./pages/student/CountdownPage"));

// Counselor Pages
const CounsellorLogin = lazy(() => import("./pages/counselor/CounsellorLogin"));
const CounsellorDashboard = lazy(() => import("./pages/counselor/Dashboard"));
const CounsellorProfilePage = lazy(() => import("./pages/counselor/CounselorProfilePage"));
const SetTimings = lazy(() => import("./pages/counselor/SetTimings"));
const UpcomingCases = lazy(() => import("./pages/counselor/upcoming"));
const CompletedCases = lazy(() => import("./pages/counselor/CompletedCases"));

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              {/* PUBLIC */}
              <Route path="/" element={<Landing />} />
              <Route path="/role-select" element={<RoleSelection />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/signup" element={<StudentSignup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/counsellor/login" element={<CounsellorLogin />} />

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

              {/* Counselor Routes */}
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

              {/* Shared */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AppProvider>
  );
};

export default App;
