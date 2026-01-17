import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Calendar, Clock, User } from "lucide-react";
import { fetchMyBookings } from "../services/studentBookingService";
import { refreshSessionStatus } from "../services/sessionStatusService";

const Profile: React.FC = () => {
  const { role } = useApp();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refresh status + Load sessions
  useEffect(() => {
    const load = async () => {
      await refreshSessionStatus();
      const data = await fetchMyBookings();
      setSessions(data);
      setLoading(false);
    };
    load();
  }, []);

  // Parse query param for tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "completed") setActiveTab("completed");
    else setActiveTab("upcoming");
  }, [location.search]);

  // ✅ Correct filtering by session status
  const filteredSessions = sessions.filter(
    s => s.status === activeTab
  );

  const getCardColor = () =>
    activeTab === "upcoming"
      ? "border-l-4 border-orange-500 bg-white/80"
      : "border-l-4 border-green-500 bg-white/80";

  const getStatusBadge = () =>
    activeTab === "upcoming"
      ? "bg-orange-100 text-orange-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="flex flex-col flex-grow animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center shadow-md">
          <User className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <p className="text-gray-600 text-sm">
            {role === "STUDENT" ? "Student Account" : "Counsellor Account"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-black/5 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "upcoming"
              ? "bg-white shadow text-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === "completed"
              ? "bg-white shadow text-green-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Sessions */}
      <div className="space-y-4 overflow-y-auto pb-4 no-scrollbar">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading sessions…</div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-white/30 rounded-xl border border-white/40">
            No {activeTab} sessions found.
          </div>
        ) : (
          filteredSessions.map(session => (
            <div
              key={session.id}
              className={`p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm ${getCardColor()}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 text-lg">
                  {session.counsellorName}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusBadge()}`}
                >
                  {activeTab}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{session.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{session.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
