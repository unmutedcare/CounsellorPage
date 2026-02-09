import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProblemDescriptionBackend from "../../services/Student_Problem_Description_BackEnd";

interface ProblemDescriptionPageProps {
  sessionId?: string;
}

const ProblemDescriptionPage: React.FC<
  ProblemDescriptionPageProps
> = ({ sessionId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const backend = useMemo(
    () => new ProblemDescriptionBackend(),
    []
  );

  const currentSessionId =
    sessionId || (location.state?.sessionId as string | undefined);

  const [problemText, setProblemText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentSessionId) {
      navigate("/dashboard");
    }
  }, [currentSessionId, navigate]);

  const submitProblem = async (): Promise<void> => {
    if (!currentSessionId) return;

    try {
      setLoading(true);
      const trimmedText = problemText.trim();

      if (trimmedText.length > 0) {
        await backend.saveDescription({
          sessionId: currentSessionId,
          description: trimmedText,
        });
      }

      navigate("/student/calendar", {
        state: { sessionId: currentSessionId },
      });
    } catch (err) {
      alert("Failed to save description");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const skipProblem = async (): Promise<void> => {
    if (!currentSessionId) return;

    try {
      setLoading(true);
      await backend.saveDescription({
        sessionId: currentSessionId,
        description: null,
      });

      navigate("/student/calendar", {
        state: { sessionId: currentSessionId },
      });
    } catch (err) {
      alert("Failed to skip description");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="problem-card">
        <div className="card-icon">✍️</div>
        <h1 className="card-title">Describe Your Feelings</h1>
        <p className="card-subtitle">Share what's on your mind (optional)</p>

        <textarea
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder="I've been feeling..."
          className="problem-textarea"
          rows={6}
        />

        <div className="buttons-row">
          <button
            disabled={loading}
            onClick={skipProblem}
            className="skip-btn"
          >
            Skip
          </button>

          <button
            disabled={loading}
            onClick={submitProblem}
            className="submit-btn"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProblemDescriptionPage;

const css = `
.problem-card {
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  width: 100%;
  max-width: 500px;
  margin: 40px auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1b5e20;
  margin: 0 0 8px 0;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 28px 0;
}

.problem-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  background: #fafafa;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.problem-textarea:focus {
  outline: none;
  border-color: #43a047;
  background: white;
}

.problem-textarea::placeholder {
  color: #9e9e9e;
}

.buttons-row {
  display: flex;
  gap: 12px;
}

.skip-btn {
  flex: 1;
  padding: 14px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.skip-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.skip-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  flex: 2;
  padding: 14px;
  background: linear-gradient(135deg, #43a047, #2e7d32);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
}

.submit-btn:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
  box-shadow: none;
}
`;