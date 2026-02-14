import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProblemDescriptionBackend from "../../services/Student_Problem_Description_BackEnd";
import { Sparkles, ArrowRight, MessageSquare, FastForward } from "lucide-react";

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
      navigate("/student/dashboard");
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
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 overflow-x-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#ff2d55] opacity-5 blur-[150px] rounded-full" />
      
      <div className="relative z-10 w-full max-w-2xl reveal">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
            <Sparkles size={14} className="text-[#ff2d55]" />
            <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Unfilter Your Mind</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter mb-4">
            Describe your <span className="text-gradient italic">truth</span>
          </h1>
          <p className="text-white/40 text-xl font-light tracking-wide">
            Share the weight on your heart. We are listening deeply.
          </p>
        </div>

        {/* Textarea Card */}
        <div className="glass-panel p-8 border border-white/5 shadow-2xl relative overflow-hidden mb-12 group">
          <div className="absolute top-6 left-6 opacity-20 text-[#ff2d55] group-focus-within:opacity-100 transition-opacity">
            <MessageSquare size={24} />
          </div>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="I've been feeling... (completely optional)"
            className="w-full bg-transparent border-none text-white text-2xl font-light placeholder:text-white/10 outline-none resize-none pt-2 min-h-[240px]"
            autoFocus
          />
        </div>

        {/* Interaction Row */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md mx-auto">
          <button
            disabled={loading}
            onClick={skipProblem}
            className="flex-1 flex items-center justify-center gap-3 py-5 rounded-full border border-white/10 hover:bg-white/5 transition-all text-white/60 hover:text-white font-luxury text-xs tracking-[0.2em] uppercase"
          >
            <FastForward size={18} />
            Skip
          </button>

          <button
            disabled={loading}
            onClick={submitProblem}
            className="flex-[2] btn-action flex items-center justify-center gap-3 text-lg py-4 shadow-brand-primary/20"
          >
            <span>{loading ? "Transcribing..." : "Continue"}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 text-white/5 font-luxury text-[10px] tracking-[1em] uppercase">
        CONFIDENTIAL • SECURE • PRIVATE
      </div>
    </div>
  );
};

export default ProblemDescriptionPage;
