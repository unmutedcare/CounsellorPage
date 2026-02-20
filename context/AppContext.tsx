import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

type Role = "STUDENT" | "COUNSELOR" | null;

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  selectedEmotions: string[];
  toggleEmotion: (emoji: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem("userRole") as Role) || null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem("userRole", newRole);
    } else {
      localStorage.removeItem("userRole");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let rawRole = (userData.role || "").toUpperCase();
            // Handle spelling variations (COUNSELOR vs COUNSELLOR)
            let normalizedRole: Role = null;
            if (rawRole === "STUDENT") normalizedRole = "STUDENT";
            else if (rawRole === "COUNSELOR" || rawRole === "COUNSELLOR") normalizedRole = "COUNSELOR";
            
            setRole(normalizedRole);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = () => setIsAuthenticated(true);

  const logout = () => {
    auth.signOut();
    setIsAuthenticated(false);
    setRole(null);
    setSelectedEmotions([]);
  };

  const toggleEmotion = (emoji: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emoji)
        ? prev.filter((e) => e !== emoji)
        : [...prev, emoji]
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isAuthenticated,
        login,
        logout,
        selectedEmotions,
        toggleEmotion,
        loading,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-2 border-[#ff2d55] border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(255,45,85,0.2)]" />
            <div className="text-sm font-luxury tracking-[0.5em] text-white opacity-40 uppercase animate-pulse">Loading Portal...</div>
          </div>
        </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
