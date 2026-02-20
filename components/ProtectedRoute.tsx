import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const ProtectedRoute = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "STUDENT" | "COUNSELOR";
}) => {
  const { isAuthenticated, role: appRole, loading } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
        <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/role-select" replace />;
  }

  // If a specific role is required, but we don't have one yet, wait a bit
  if (role && !appRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
        <div className="w-12 h-12 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (role && appRole !== role) {
    console.warn(`Role mismatch: expected ${role}, got ${appRole}. Redirecting...`);
    return <Navigate to="/role-select" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
