import React, { useEffect, useMemo, useState } from "react";
import { Clock, Trash2, Plus, Save, X } from "lucide-react";
import { getAuth } from "firebase/auth";
import { CounsellorTimingBackend } from "../../services/CounsellorSetTimingsBackend";

const MAX_SESSIONS_PER_DAY = 3;

const SetTiming: React.FC = () => {
  const [counsellorId, setCounsellorId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = getAuth().onAuthStateChanged(user => {
      console.log("👤 Auth state:", user?.uid);
      if (user) setCounsellorId(user.uid);
    });
    return () => unsub();
  }, []);

  const backend = useMemo(() => {
    if (!counsellorId) return null;
    return new CounsellorTimingBackend(counsellorId);
  }, [counsellorId]);

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [focusedMonth, setFocusedMonth] = useState(new Date());
  const [timings, setTimings] = useState<Record<string, string[]>>({});
  const [newTime, setNewTime] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (backend) loadSavedTimings();
  }, [backend]);

  const loadSavedTimings = async () => {
    setLoading(true);
    try {
      const sessions = await backend.getCounsellorSessions();
      setTimings(sessions);
    } catch (e) {
      console.error("Failed to load sessions", e);
    } finally {
      setLoading(false);
    }
  };

  const validateTime = (time: string) =>
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);

  const normalizeTime = (time: string) => {
    const [h, m] = time.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  const addSession = () => {
    const current = timings[selectedDate] || [];

    if (current.length >= MAX_SESSIONS_PER_DAY) {
      alert(`Max ${MAX_SESSIONS_PER_DAY} sessions allowed`);
      return;
    }

    if (!validateTime(newTime)) {
      alert("Use HH:MM format");
      return;
    }

    const formatted = normalizeTime(newTime);

    if (current.includes(formatted)) {
      alert("Session already exists");
      return;
    }

    setTimings({
      ...timings,
      [selectedDate]: [...current, formatted].sort(),
    });

    setNewTime("");
    setShowAdd(false);
  };

  const removeSession = (time: string) => {
    const updated = (timings[selectedDate] || []).filter(t => t !== time);

    if (updated.length === 0) {
      const clone = { ...timings };
      delete clone[selectedDate];
      setTimings(clone);
    } else {
      setTimings({ ...timings, [selectedDate]: updated });
    }
  };

  const saveAllSessions = async () => {
    if (Object.keys(timings).length === 0) {
      alert("Add at least one session");
      return;
    }

    setLoading(true);
    try {
      await backend.initializeCounsellorDocument();
      await backend.saveSessions(timings);

      const saved = await backend.getCounsellorSessions();
      setTimings(saved);

      alert("Sessions saved successfully");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, firstDay, daysInMonth };
  };

  const renderCalendar = () => {
    const { year, month, firstDay, daysInMonth } = getMonthData(focusedMonth);
    const days: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const hasSessions = timings[dateStr]?.length > 0;
      const isPast = dateStr < today;

      days.push(
        <button
          key={dateStr}
          disabled={isPast}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-10 rounded-lg font-semibold transition
            ${dateStr === selectedDate ? "bg-green-600 text-white" : ""}
            ${hasSessions ? "bg-green-100" : ""}
            ${isPast ? "opacity-40 cursor-not-allowed" : "hover:bg-green-200"}
          `}
        >
          {d}
        </button>
      );
    }

    return <div className="grid grid-cols-7 gap-2">{days}</div>;
  };

  const currentSessions = timings[selectedDate] || [];

  return (
    <div className="w-full min-h-screen px-17 py-7">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold mb-6">Set Counsellor Timings</h1>

        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          {renderCalendar()}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold">
            Sessions for {selectedDate}
          </div>
          <span className="text-sm">
            {currentSessions.length}/{MAX_SESSIONS_PER_DAY}
          </span>
        </div>

        <div className="space-y-2">
          {currentSessions.map(time => (
            <div
              key={time}
              className="flex justify-between items-center p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2 text-lg font-semibold tracking-wide">
                <Clock size={18} />
                {time}
              </div>
              <button onClick={() => removeSession(time)}>
                <Trash2 size={18} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>

        {showAdd ? (
          <div className="flex gap-3 mt-5 items-center">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              step="900"
              className="border px-3 py-2 rounded w-40 cursor-pointer"
            />

            <button onClick={addSession} className="bg-green-600 text-white px-5 py-2 rounded">
              Add
            </button>

            <button onClick={() => setShowAdd(false)}>
              <X />
            </button>
          </div>
        ) : (
          <button
            disabled={currentSessions.length >= MAX_SESSIONS_PER_DAY}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 mt-5 bg-green-600 text-white px-5 py-2 rounded"
          >
            <Plus /> Add Session
          </button>
        )}

        <button
          onClick={saveAllSessions}
          disabled={loading}
          className="mt-8 w-full bg-teal-600 text-white py-3 rounded font-bold"
        >
          <Save className="inline mr-2" />
          Save All Sessions
        </button>

      </div>
    </div>
  );
};

export default SetTiming;