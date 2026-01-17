import React, { useEffect, useState } from "react";
import { fetchMyBookings } from "../../services/studentBookingService";

const MySessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchMyBookings();
      setSessions(data);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen p-10 bg-gradient-to-b from-green-300 to-yellow-200">
      <h2 className="text-3xl font-bold text-center mb-8">My Sessions</h2>

      <div className="max-w-xl mx-auto space-y-4">
        {loading && (
          <p className="text-center text-gray-600">Loading sessions...</p>
        )}

        {!loading && sessions.length === 0 && (
          <p className="text-center text-gray-600">No sessions booked yet.</p>
        )}

        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-xl shadow-md"
          >
            <p><strong>Counsellor:</strong> {s.counsellorName}</p>
            <p><strong>Date:</strong> {s.date}</p>
            <p><strong>Time:</strong> {s.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MySessions;
