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
  const [role, setRole] = useState<Role>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Normalize role to Uppercase to match types ("student" -> "STUDENT")
            const userRole = userData.role ? userData.role.toUpperCase() as Role : null;
            setRole(userRole);
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-xl font-semibold text-gray-700">Loading unmuted...</div>
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
