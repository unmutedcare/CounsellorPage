import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CalendarBackend from "../../services/Calender_Backend";
import { Sparkles, Calendar as CalendarIcon, Clock, ChevronRight, Wind, ChevronLeft } from "lucide-react";

interface CalendarPageProps {
  sessionId?: string;
}

type SlotMap = Record<string, Array<Record<string, any>>>;

const CalendarPage: React.FC<CalendarPageProps> = ({ sessionId }) => {
  const backend = useMemo(() => new CalendarBackend(), []);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSessionId = sessionId || (location.state?.sessionId as string);

  useEffect(() => {
    if (!currentSessionId) {
      navigate("/student/dashboard");
    }
  }, [currentSessionId, navigate]);

  const [slots, setSlots] = useState<SlotMap>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      handleDateSelect(availableDates[0]);
    }
  }, []);

  const slotDateTime = (date: Date, time: string): Date => {
    let hour = 0;
    let minute = 0;

    if (time.includes(" ")) {
      const [hm, period] = time.split(" ");
      const [h, m] = hm.split(":");
      hour = parseInt(h);
      minute = parseInt(m);

      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
    } else {
      const [h, m] = time.split(":");
      hour = parseInt(h);
      minute = parseInt(m);
    }

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute
    );
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSlots({});
    setIsLoadingSlots(true);

    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    // 🔄 REAL-TIME LISTENER: Vanish booked slots instantly
    const { onSnapshot, collection, query, where } = await import("firebase/firestore");
    const { db } = await import("../../firebase/firebase");

    const q = query(
      collection(db, "GlobalSessions"),
      where("date", "==", dateStr),
      where("isBooked", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSlots: SlotMap = {};
      const now = new Date();
      let totalCount = 0;
      let visibleCount = 0;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const time = data.time as string;
        const dt = slotDateTime(date, time);

        // Filter out past slots
        if (date.toDateString() !== now.toDateString() || dt > now) {
          fetchedSlots[time] ??= [];
          fetchedSlots[time].push({
            counsellorId: data.counsellorId,
            initials: data.counsellorInitials,
            username: data.counsellorUsername,
            email: data.counsellorEmail,
            docId: docSnap.id,
          });
          visibleCount++;
        }
        totalCount++;
      });

      if (totalCount > 0 && visibleCount === 0 && date.toDateString() === now.toDateString()) {
        console.log(`Hidden ${totalCount} past slots.`);
      }

      setSlots(fetchedSlots);
      setIsLoadingSlots(false);
    }, (err) => {
      alert("Failed to load available slots.");
      console.error(err);
      setIsLoadingSlots(false);
    });

    return unsubscribe;
  };

  // Keep track of the active listener to clean it up
  const activeUnsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!selectedDate) {
        const unsub = await handleDateSelect(availableDates[0]);
        activeUnsubscribe.current = unsub;
      }
    };
    init();
    return () => {
      if (activeUnsubscribe.current) activeUnsubscribe.current();
    };
  }, []);

  const handleDateChange = async (date: Date) => {
    if (activeUnsubscribe.current) activeUnsubscribe.current();
    const unsub = await handleDateSelect(date);
    activeUnsubscribe.current = unsub;
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    const [time, slotDocId] = selectedTime.split("_");
    const counsellor = slots[time]?.find(
      (c) => c.docId === slotDocId
    );

    if (!counsellor) {
      alert("Selected slot is no longer available.");
      return;
    }

    const dateStr = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    if (!window.confirm(`Confirm your session for ${dateStr} at ${time}?`)) return;

    try {
      await backend.bookSlot({
        sessionId: currentSessionId,
        slotDocId,
        dateStr,
        time,
        counsellorId: counsellor.counsellorId,
        counsellorInitials: counsellor.initials,
      });

      navigate(`/student/payment?sessionId=${currentSessionId}`);
    } catch (err: any) {
      alert(`Scheduling failed: ${err.message || err}`);
      console.error(err);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col p-6 overflow-x-hidden">
      {/* Background Accents */}
      <div className="absolute top-[15%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary opacity-5 blur-[150px] rounded-full" />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-grow flex-col reveal">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
            <CalendarIcon size={14} className="text-brand-secondary" />
            <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Secure Scheduling</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
            Select your <span className="text-gradient italic">slot</span>
          </h2>
          <p className="text-white/40 text-lg font-light tracking-wide">
            Choose a convenient time for your private session.
          </p>
        </div>

        {/* Date Scroller */}
        <div className="relative mb-12 group">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 p-2 glass-panel border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2"
          >
            {availableDates.map((date, i) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();
              const monthName = date.toLocaleDateString('en-US', { month: 'short' });

              return (
                <button
                  key={i}
                  onClick={() => handleDateChange(date)}
                  className={`flex-shrink-0 w-20 h-28 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 border
                    ${isSelected 
                      ? "bg-brand-secondary border-brand-secondary shadow-lg shadow-brand-secondary/30 scale-105" 
                      : "glass-panel border-white/5 hover:border-white/20"}
                  `}
                >
                  <span className={`text-[10px] font-luxury tracking-widest uppercase mb-2 ${isSelected ? 'text-white' : 'text-white/40'}`}>{dayName}</span>
                  <span className="text-2xl font-bold mb-1">{dayNum}</span>
                  <span className={`text-[9px] font-luxury tracking-[0.2em] uppercase ${isSelected ? 'text-white/80' : 'text-white/20'}`}>{monthName}</span>
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 p-2 glass-panel border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Slots Section */}
        <div className="flex-grow">
          <div className="glass-panel p-8 border border-white/5 min-h-[400px]">
             <div className="flex items-center justify-between mb-8">
                <label className="text-[10px] font-luxury uppercase tracking-[0.3em] text-brand-secondary uppercase">Availability Map</label>
                {selectedDate && (
                  <span className="text-[10px] font-luxury tracking-widest text-white/30 uppercase">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
             </div>

             {isLoadingSlots ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-12 h-12 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                  <p className="text-[10px] font-luxury tracking-widest text-white/20 uppercase animate-pulse">Fetching Appointments...</p>
                </div>
             ) : Object.keys(slots).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-white/20 text-center">
                  <Wind size={48} className="mb-6 opacity-30 animate-pulse" />
                  <p className="font-luxury tracking-widest text-sm uppercase max-w-xs">No available slots for the selected date. Please choose another day.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal">
                  {Object.entries(slots).map(([time, counsellors]) => (
                    <div key={time} className="glass-panel p-6 border-white/5 group hover:border-white/10 transition-all bg-white/[0.01]">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-8 h-8 rounded-full bg-brand-secondary/10 flex items-center justify-center">
                            <Clock size={14} className="text-brand-secondary" />
                         </div>
                         <span className="text-xl font-bold tracking-tight">{time}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {counsellors.map((c) => {
                          const key = `${time}_${c.docId}`;
                          const isSelected = selectedTime === key;
                          return (
                            <button
                              key={c.docId}
                              onClick={() => setSelectedTime(key)}
                              className={`px-4 py-2 rounded-xl font-luxury text-[9px] tracking-widest uppercase transition-all duration-500 flex items-center gap-2
                                ${isSelected 
                                  ? "bg-brand-secondary text-white shadow-lg shadow-brand-secondary/30 scale-105" 
                                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5"}
                              `}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-pulse' : 'bg-brand-secondary'}`} />
                              {c.initials}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 pb-12 w-full max-w-md mx-auto">
          <button
            disabled={!selectedDate || !selectedTime}
            onClick={handleConfirm}
            className={`btn-action w-full flex items-center justify-center gap-4 text-xl py-6 shadow-2xl transition-all duration-700
              ${(!selectedDate || !selectedTime) ? 'opacity-20 cursor-not-allowed grayscale' : 'shadow-brand-secondary/20'}
            `}
          >
            <span>Confirm Appointment</span>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
