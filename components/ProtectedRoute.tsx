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
  const { isAuthenticated, role: appRole } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/role-select" replace />;
  }

  if (role && appRole !== role) {
    return <Navigate to="/role-select" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
