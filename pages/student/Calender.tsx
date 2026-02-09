import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CalendarBackend from "../../services/Calender_Backend";

interface CalendarPageProps {
  sessionId?: string;
}

type SlotMap = Record<string, Array<Record<string, any>>>;

const CalendarPage: React.FC<CalendarPageProps> = ({ sessionId }) => {
  const backend = useMemo(() => new CalendarBackend(), []);
  const navigate = useNavigate();
  const location = useLocation();

  const currentSessionId = sessionId || (location.state?.sessionId as string);

  useEffect(() => {
    if (!currentSessionId) {
      navigate("/dashboard");
    }
  }, [currentSessionId, navigate]);

  const [slots, setSlots] = useState<SlotMap>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = new Date();

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

  const showConfirmationDialog = (
    date: string,
    time: string,
    counsellorInitials: string
  ): boolean => {
    return window.confirm(
      `Confirm Session\n\nDate: ${date}\nTime: ${time}\nCounsellor: ${counsellorInitials}\n\nAre you happy with this timing?`
    );
  };

  const handleDateSelect = async (date: Date) => {
    if (isNaN(date.getTime())) return;

    try {
      setSelectedDate(date);
      setSelectedTime(null);
      setSlots({});
      setIsLoadingSlots(true);

      const fetchedSlots = await backend.getAvailableSlots(date);
      const now = new Date();
      const filtered: SlotMap = {};

      Object.entries(fetchedSlots).forEach(([time, counsellors]) => {
        const dt = slotDateTime(date, time);

        if (
          date.toDateString() !== now.toDateString() ||
          dt > now
        ) {
          filtered[time] = counsellors;
        }
      });

      setSlots(filtered);
    } catch (err) {
      alert("Failed to load slots");
      console.error(err);
    } finally {
      setIsLoadingSlots(false);
    }
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

    const confirmed = showConfirmationDialog(
      dateStr,
      time,
      counsellor.initials
    );

    if (!confirmed) return;

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
    } catch (err) {
      alert("Booking failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <>
      <style>{css}</style>
      
        <div className="calendar-card">
          <h1 className="card-title">📅 Select Date & Time</h1>

          <div className="date-section">
            <label className="section-label">Choose a Date</label>
            <input
              type="date"
              onChange={(e) => handleDateSelect(new Date(e.target.value))}
              min={today.toISOString().split("T")[0]}
              max={new Date(today.getTime() + 30 * 86400000)
                .toISOString()
                .split("T")[0]}
              className="date-input"
            />
          </div>

          <div className="slots-section">
            <label className="section-label">Available Timings</label>

            {!selectedDate && (
              <p className="placeholder-text">Please select a date first.</p>
            )}

            {selectedDate && isLoadingSlots && (
              <div className="loading-text">Loading...</div>
            )}

            {selectedDate && !isLoadingSlots && Object.keys(slots).length === 0 && (
              <p className="placeholder-text">No available slots for this date.</p>
            )}

            {selectedDate && !isLoadingSlots && Object.keys(slots).length > 0 && (
              <div className="slots-list">
                {Object.entries(slots).map(([time, counsellors]) => (
                  <div key={time} className="time-group">
                    <p className="time-label">{time}</p>
                    <div className="counsellors-row">
                      {counsellors.map((c) => {
                        const key = `${time}_${c.docId}`;
                        const selected = selectedTime === key;

                        return (
                          <button
                            key={c.docId}
                            onClick={() => setSelectedTime(key)}
                            className={`counsellor-btn ${selected ? "selected" : ""}`}
                          >
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

          <button
            disabled={!selectedDate || !selectedTime}
            onClick={handleConfirm}
            className="confirm-btn"
          >
            Confirm Booking
          </button>
        </div>
      
    </>
  );
};

export default CalendarPage;

const css = `
.calendar-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1b5e20;
  text-align: center;
  margin: 0 0 28px 0;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 10px;
}

.date-section {
  margin-bottom: 24px;
}

.date-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background: #fafafa;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #43a047;
  background: white;
}

.slots-section {
  margin-bottom: 24px;
}

.placeholder-text {
  color: #9e9e9e;
  font-size: 14px;
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
}

.loading-text {
  text-align: center;
  color: #2e7d32;
  padding: 20px;
}

.slots-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.time-group {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 14px;
}

.time-label {
  font-weight: 700;
  color: #1b5e20;
  margin: 0 0 10px 0;
}

.counsellors-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.counsellor-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  color: #1b5e20;
  cursor: pointer;
  transition: all 0.2s;
}

.counsellor-btn:hover {
  border-color: #43a047;
  background: #e8f5e9;
}

.counsellor-btn.selected {
  background: #43a047;
  border-color: #43a047;
  color: white;
}

.confirm-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #43a047, #2e7d32);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
}

.confirm-btn:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
  box-shadow: none;
}
`;