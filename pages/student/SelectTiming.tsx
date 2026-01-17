import React, { useEffect, useState } from "react";
import { fetchCounsellorsForStudent } from "../../services/studentCounsellorService";
import { bookSession } from "../../services/bookingService";

const SelectTiming: React.FC = () => {
  const [counsellors, setCounsellors] = useState<any[]>([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCounsellorsForStudent();
      setCounsellors(data);
    };
    load();
  }, []);

  const handleBooking = async (date: string, time: string) => {
    if (!selectedCounsellor || loading) return;

    try {
      setLoading(true);

      await bookSession(
        selectedCounsellor.uid,
        selectedCounsellor.initials || "Anonymous",
        date,
        time
      );

      // 🧹 Remove booked slot from UI immediately
      const updated = { ...selectedCounsellor };
      updated.sessions = { ...updated.sessions };
      updated.sessions[date] = updated.sessions[date].filter(
        (t: string) => t !== time
      );

      // Remove empty date
      if (updated.sessions[date].length === 0) {
        delete updated.sessions[date];
      }

      setSelectedCounsellor(updated);

      alert("Session booked successfully!");
    } catch (err) {
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-b from-green-300 to-yellow-200">
      <h2 className="text-3xl font-bold text-center mb-10">
        Choose Your Counsellor
      </h2>

      <div className="max-w-2xl mx-auto space-y-6">
        {!selectedCounsellor &&
          counsellors.map((c) => (
            <div
              key={c.uid}
              onClick={() => setSelectedCounsellor(c)}
              className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:scale-[1.02] transition"
            >
              <h3 className="text-xl font-semibold">
                Counsellor: {c.initials || "Anonymous"}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {Object.keys(c.sessions).length || 0} days available
              </p>
            </div>
          ))}

        {selectedCounsellor && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              Counsellor: {selectedCounsellor.initials || "Anonymous"}
            </h3>

            <p className="font-medium mb-2">Select a time:</p>

            {Object.entries(selectedCounsellor.sessions).length === 0 && (
              <p className="text-sm text-gray-500">No more slots available</p>
            )}

            {Object.entries(selectedCounsellor.sessions).map(
              ([date, times]: any) => (
                <div key={date} className="mb-4">
                  <p className="font-semibold">{date}</p>

                  <div className="flex flex-wrap gap-3 mt-2">
                    {times.map((t: string) => (
                      <button
                        key={t}
                        disabled={loading}
                        className="px-4 py-2 bg-green-200 rounded-lg hover:bg-green-300 transition disabled:opacity-50"
                        onClick={() => handleBooking(date, t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            <button
              className="mt-6 text-sm text-green-700 underline"
              onClick={() => setSelectedCounsellor(null)}
            >
              ← Back to counsellor list
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectTiming;
