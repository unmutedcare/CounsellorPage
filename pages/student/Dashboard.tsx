import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const quotes = [
  `"The oak fought the wind and was broken, the willow bent when it must and survived." – Robert Jordan`,
  `"Sometimes the people around you won't understand your journey. It's not for them." – Joubert Botha`,
  `"Healing takes time, and asking for help is a courageous step." – Mariska Hargitay`,
  `"You don't have to control your thoughts. You just have to stop letting them control you." – Dan Millman`,
];

const getQuoteOfTheDay = () => {
  const day = new Date().getDate();
  return quotes[day % quotes.length];
};

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // HERO BUTTON LOGIC
  // ---------------------------------------------
  const handleTalkToSomeone = async () => {
    setLoading(true);

    // Navigate directly to emotion selection to start a new session
    navigate("/student/emotion-selection");

    setLoading(false);
  };

  return (
    <>
      <style>{css}</style>

      
        {/* APP BAR */}
        <div className="appbar">
          <button
            className="profile-btn"
            onClick={() => navigate("/profile")}
          >
            👤
          </button>
        </div>

        {/* QUOTE CARD */}
        <div className="quote-card">
          <span className="quote-icon">❝</span>
          <p>{getQuoteOfTheDay()}</p>
        </div>

        {/* HERO BUTTON */}
        <div className="hero" onClick={handleTalkToSomeone}>
          <div className="hero-icon">🧘</div>
          <h1>Talk To Someone</h1>
          <p>Connect with a counselor</p>
        </div>

        {/* FEATURES */}
        <div className="features">
          <h2>Explore More</h2>
          <Feature text="Community (Coming Soon)" />
          <Feature text="AI Quick Solutions (Coming Soon)" />
          <Feature text="Daily Journal (Coming Soon)" />
          <Feature text="Meditation Room (Coming Soon)" />
        </div>

        {/* CONTACT US FAB */}
        <button
          className="fab"
          onClick={() => navigate("/help")}
        >
          💬 Contact Us
        </button>

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="overlay">
            <div className="spinner" />
          </div>
        )}
      
    </>
  );
};

const Feature = ({ text }: { text: string }) => (
  <div className="feature">
    <span>🌱</span>
    <p>{text}</p>
  </div>
);

export default StudentDashboard;

// ---------------------------------------------
// CSS (INLINE, SAME FILE)
// ---------------------------------------------
const css = `
.page {
  min-height: 100vh;
  padding: 20px 20px 100px;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #1b5e20;
  position: relative;
}

.appbar {
  display: flex;
  justify-content: flex-end;
}

.profile-btn {
  background: white;
  border: none;
  font-size: 28px;
  color: #1b5e20;
  cursor: pointer;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.quote-card {
  margin-top: 20px;
  padding: 16px;
  background: white;
  color: #1b5e20;
  border-radius: 18px;
  display: flex;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.quote-icon {
  font-size: 26px;
}

.hero {
  margin-top: 35px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #43a047, #2e7d32);
  border-radius: 28px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(0,0,0,0.3);
}

.hero-icon {
  font-size: 54px;
}

.hero h1 {
  margin: 18px 0 8px;
  font-size: 28px;
  color: white;
}

.hero p {
  color: rgba(255,255,255,0.85);
}

.features {
  margin-top: 40px;
}

.features h2 {
  margin-bottom: 16px;
}

.feature {
  margin-top: 12px;
  padding: 14px;
  background: white;
  border-radius: 16px;
  color: #1b5e20;
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #43a047;
  color: white;
  border: none;
  padding: 14px 22px;
  border-radius: 28px;
  font-size: 16px;
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #c8e6c9;
  border-top: 4px solid #1b5e20;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.center {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
