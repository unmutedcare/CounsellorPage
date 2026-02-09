import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// 🔗 Backend (same logic, just JS versions)
import CountdownBackend from "../../services/CountdownPage_backend";

// Optional background wrapper


const CountdownPage = ({ sessionId: propSessionId }: { sessionId?: string }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = propSessionId || searchParams.get("sessionId");
    const backend = useRef(new CountdownBackend()).current;
    const timerRef = useRef(null);

    const [remaining, setRemaining] = useState(0);
    const [joinEnabled, setJoinEnabled] = useState(false);

    // EXISTING FIELDS
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [counsellor, setCounsellor] = useState("TBD");
    const [sessionDateTime, setSessionDateTime] = useState(null);

    // NEW FIELDS
    const [counsellorUsername, setCounsellorUsername] = useState("");
    const [counsellorEmail, setCounsellorEmail] = useState("");

    // ---------------- HUMANIZE (UNCHANGED LOGIC) ----------------
    const humanize = (seconds) => {
        if (seconds <= 0) return "Starting now";

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds / 60);

        if (days >= 7) {
            const weeks = Math.floor(days / 7);
            return weeks === 1
                ? "Starts in 1 week"
                : `Starts in ${weeks} weeks`;
        }

        if (days >= 2) return `Starts in ${days} days`;
        if (days === 1) return "Starts tomorrow";
        if (hours >= 2) return `Starts in ${hours} hours`;
        if (hours === 1) return "Starts in 1 hour";
        if (minutes >= 2) return `Starts in ${minutes} minutes`;
        if (minutes === 1) return "Starts in 1 minute";

        return "Starting now";
    };

    // ---------------- LOAD SESSION ----------------
    useEffect(() => {
        loadSession();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line
    }, []);

    const loadSession = async () => {
        if (!sessionId) {
            console.error("No sessionId found in URL or props");
            return;
        }
        const data = await backend.getSessionDetails(sessionId);

        setSessionDateTime(data.sessionTimestamp);
        setDate(data.date);
        setTime(data.time);
        setCounsellor(data.counsellorInitials);

        setCounsellorUsername(data.counsellorUsername || "");
        setCounsellorEmail(data.counsellorEmail || "");

        const rem = backend.getRemainingTime(data.sessionTimestamp);
        setRemaining(rem);
        setJoinEnabled(backend.canJoinSession(data.sessionTimestamp));

        startCountdown(data.sessionTimestamp);
    };

    // ---------------- COUNTDOWN ----------------
    const startCountdown = (timestamp) => {
        timerRef.current = setInterval(() => {
            const rem = backend.getRemainingTime(timestamp);
            setRemaining(rem);
            setJoinEnabled(backend.canJoinSession(timestamp));

            if (rem <= 0) {
                clearInterval(timerRef.current);
            }
        }, 1000);
    };

    // ---------------- JOIN HANDLER ----------------
    const handleJoin = async () => {
        try {
            const link = await backend.getMeetingLink(sessionId);
            await backend.markSessionLive(sessionId);

            window.open(link, "_blank", "noopener,noreferrer");
        } catch (e) {
            alert(
                "Unable to open meeting link. Please open it manually.\n" + e
            );
        }
    };

    // ---------------- PREVENT BACK ----------------
    useEffect(() => {
        const blockBack = () => {
            navigate("/home", { replace: true });
        };
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = blockBack;

        return () => {
            window.onpopstate = null;
        };
    }, [navigate]);

    return (
        <div className="countdown-page">
            <style>{`
                .countdown-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); /* Light Green Gradient */
                    display: flex;
                    flex-direction: column;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #2e7d32;
                }

                .app-bar {
                    background: rgba(255, 255, 255, 0.9);
                    padding: 1rem;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    backdrop-filter: blur(10px);
                }

                .app-bar h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: #1b5e20;
                    font-weight: 600;
                }

                .content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    gap: 1.5rem;
                    max-width: 600px;
                    margin: 0 auto;
                    width: 100%;
                }

                .confirmed {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    animation: popIn 0.5s ease;
                }

                .check {
                    font-size: 3rem;
                    color: #4caf50;
                    background: #fff;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
                }

                .confirmed h1 {
                    margin: 0;
                    font-size: 1.75rem;
                    color: #1b5e20;
                }

                .status-pill {
                    background: #fff;
                    padding: 0.75rem 1.5rem;
                    border-radius: 50px;
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    text-align: center;
                    min-width: 250px;
                }

                .status-pill.green {
                    background: #e8f5e9;
                    color: #2e7d32;
                    border: 1px solid #a5d6a7;
                }

                .status-pill.orange {
                    background: #fff3e0;
                    color: #ef6c00;
                    border: 1px solid #ffcc80;
                }

                .card {
                    background: #fff;
                    width: 100%;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #f0f0f0;
                }

                .info-row:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .info-row strong {
                    color: #555;
                    font-weight: 500;
                }

                .info-row span {
                    font-weight: 600;
                    color: #2e7d32;
                }

                .join-btn {
                    width: 100%;
                    padding: 1rem;
                    border: none;
                    border-radius: 12px;
                    background: #2e7d32;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
                }

                .join-btn:disabled {
                    background: #a5d6a7;
                    cursor: not-allowed;
                    box-shadow: none;
                    opacity: 0.7;
                }

                .join-btn:hover:not(:disabled) {
                    background: #1b5e20;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(46, 125, 50, 0.3);
                }

                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }

                @media (max-width: 480px) {
                    .content { padding: 1.5rem; }
                    .confirmed h1 { font-size: 1.5rem; }
                }
            `}</style>
            <header className="app-bar">
                <h2>Session Booked</h2>
            </header>

            <div className="content">
                <div className="confirmed">
                    <span className="check">✔</span>
                    <h1>Session Confirmed</h1>
                </div>

                <div
                    className={`status-pill ${joinEnabled ? "green" : "orange"
                        }`}
                >
                    {joinEnabled
                        ? "You can now join the session"
                        : humanize(remaining)}
                </div>

                <div className="card">
                    <InfoRow label="Date" value={date} />
                    <InfoRow label="Time" value={time} />
                    <InfoRow label="Counsellor Initials" value={counsellor} />

                    {counsellorUsername && (
                        <InfoRow label="Name" value={counsellorUsername} />
                    )}

                    {counsellorEmail && (
                        <InfoRow label="Email" value={counsellorEmail} />
                    )}
                </div>

                <button
                    className="join-btn"
                    disabled={!joinEnabled}
                    onClick={handleJoin}
                >
                    Join Now
                </button>
            </div>
        </div>

    );
};

// ---------------- INFO ROW ----------------
const InfoRow = ({ label, value }) => (
    <div className="info-row">
        <strong>{label}:</strong>
        <span>{value}</span>
    </div>
);

export default CountdownPage;
