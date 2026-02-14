import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, Plus, Save, X, Calendar as CalendarIcon, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "../../firebase/firebase";
import { CounsellorTimingBackend } from "../../services/CounsellorSetTimingsBackend";

const MAX_SESSIONS_PER_DAY = 3;

const SetTiming: React.FC = () => {
  const navigate = useNavigate();
  const [counsellorId, setCounsellorId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = auth.onAuthStateChanged((user: any) => {
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
    if (!backend) return;
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
    if (!backend) return;
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

  const changeMonth = (delta: number) => {
    const newDate = new Date(focusedMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setFocusedMonth(newDate);
  };

  const renderCalendar = () => {
    const { year, month, firstDay, daysInMonth } = getMonthData(focusedMonth);
    const days: JSX.Element[] = [];
    const monthName = focusedMonth.toLocaleString('default', { month: 'long' });

    for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const hasSessions = timings[dateStr]?.length > 0;
      const isPast = dateStr < today;
      const isSelected = dateStr === selectedDate;

      days.push(
        <button
          key={dateStr}
          disabled={isPast}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-12 w-full rounded-2xl font-luxury text-[10px] tracking-widest transition-all duration-500
            ${isSelected ? "bg-[#4caf50] text-white shadow-lg shadow-[#4caf50]/20" : ""}
            ${hasSessions && !isSelected ? "bg-white/10 text-white" : ""}
            ${isPast ? "opacity-10 cursor-not-allowed grayscale" : "hover:bg-white/5"}
            ${!isSelected && !hasSessions && !isPast ? "text-white/30" : ""}
          `}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center px-2">
           <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft size={20}/></button>
           <h3 className="font-luxury tracking-[0.4em] uppercase text-sm">{monthName} {year}</h3>
           <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronRight size={20}/></button>
        </div>
        <div className="grid grid-cols-7 gap-3 text-center mb-4">
          {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-luxury text-white/20 tracking-widest">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-3">{days}</div>
      </div>
    );
  };

  const currentSessions = timings[selectedDate] || [];

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white p-6 pb-24 overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-[#4caf50] opacity-[0.03] blur-[150px] rounded-full animate-pulse-glow" />
      
      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col pt-12 reveal">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
            <Sparkles size={14} className="text-[#4caf50]" />
            <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Availability Curation</span>
          </div>
          <h2 className="text-6xl font-bold tracking-tighter mb-4">
            Sacred <span className="text-gradient italic">Windows</span>
          </h2>
          <p className="text-white/40 text-xl font-light tracking-wide max-w-2xl mx-auto">
            Design your presence in the sanctuary. When are you ready to listen deeply?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Calendar Side */}
          <div className="glass-panel p-10 border border-white/5 shadow-2xl">
             <div className="mb-10 flex items-center gap-3">
                <CalendarIcon size={18} className="text-[#4caf50]" />
                <span className="text-[10px] font-luxury tracking-[0.3em] text-[#4caf50] uppercase">The Cycle</span>
             </div>
             {renderCalendar()}
          </div>

          {/* Sessions Side */}
          <div className="glass-panel p-10 border border-white/5 shadow-2xl flex flex-col">
             <div className="mb-10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Clock size={18} className="text-[#4caf50]" />
                   <span className="text-[10px] font-luxury tracking-[0.3em] text-[#4caf50] uppercase">Intervals for {selectedDate}</span>
                </div>
                <span className="text-[10px] font-luxury tracking-widest text-white/30">{currentSessions.length}/{MAX_SESSIONS_PER_DAY} SLOTS</span>
             </div>

             <div className="space-y-4 flex-grow">
                {currentSessions.map(time => (
                  <div key={time} className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-[#4caf50]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#4caf50]/10 flex items-center justify-center">
                         <Clock size={16} className="text-[#4caf50]" />
                      </div>
                      <span className="text-2xl font-light tracking-widest">{time}</span>
                    </div>
                    <button onClick={() => removeSession(time)} className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                {currentSessions.length === 0 && !showAdd && (
                  <div className="h-full flex flex-col items-center justify-center text-white/10 py-20">
                     <Clock size={48} className="mb-4 opacity-50" />
                     <p className="font-luxury tracking-widest text-[10px] uppercase">No intervals defined</p>
                  </div>
                )}

                {showAdd ? (
                  <div className="flex gap-4 items-center p-6 glass-panel border-[#4caf50]/30 animate-in zoom-in-95 duration-300">
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      step="900"
                      className="flex-grow bg-transparent text-2xl font-light outline-none border-none cursor-pointer"
                    />
                    <div className="flex gap-2">
                      <button onClick={addSession} className="p-3 bg-[#4caf50] text-white rounded-xl shadow-lg shadow-[#4caf50]/20"><Plus size={20}/></button>
                      <button onClick={() => setShowAdd(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><X size={20}/></button>
                    </div>
                  </div>
                ) : (
                  currentSessions.length < MAX_SESSIONS_PER_DAY && (
                    <button
                      onClick={() => setShowAdd(true)}
                      className="w-full py-6 rounded-3xl border border-dashed border-white/10 text-white/30 hover:text-[#4caf50] hover:border-[#4caf50]/50 hover:bg-[#4caf50]/5 transition-all flex flex-col items-center gap-2 mt-4"
                    >
                      <Plus size={24} />
                      <span className="text-[10px] font-luxury tracking-widest uppercase">Add New Interval</span>
                    </button>
                  )
                )}
             </div>

             <button
                onClick={saveAllSessions}
                disabled={loading || currentSessions.length === 0}
                className={`mt-12 w-full py-6 rounded-full flex items-center justify-center gap-4 text-xl font-bold shadow-2xl transition-all duration-700
                  ${loading || currentSessions.length === 0 ? 'opacity-20 grayscale cursor-not-allowed' : 'bg-[#4caf50] shadow-[#4caf50]/20 hover:scale-[1.02]'}
                `}
             >
                {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={24}/> Commit Windows</>}
             </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 text-white/5 font-luxury text-[10px] tracking-[1.5em] uppercase left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
        S C H E D U L E • C U R A T I O N
      </div>
    </div>
  );
};

export default SetTiming;
