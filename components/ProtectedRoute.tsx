import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const ProtectedRoute = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "student" | "counsellor";
}) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      if (!role) {
        setAllowed(true);
        setLoading(false);
        return;
      }

      const ref = doc(
        db,
        role === "student" ? "Users" : "Counsellors",
        user.uid
      );

      const snap = await getDoc(ref);
      setAllowed(snap.exists());
      setLoading(false);
    });

    return () => unsub();
  }, [role]);

  if (loading) return <p>Loading...</p>;
  if (!allowed) return <Navigate to="/auth" />;

  return <>{children}</>;
};

export default ProtectedRoute;
