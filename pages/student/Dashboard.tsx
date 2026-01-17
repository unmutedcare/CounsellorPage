import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { MessageCircleHeart } from "lucide-react";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center flex-grow space-y-10 animate-in fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[#3E5C35]">Welcome, Friend.</h2>
        <p className="text-[#5B8C5A]">
          Whatever is on your mind, we're here to listen.
        </p>
      </div>

      <div className="w-full max-w-xs">
        <Button
          fullWidth
          className="h-24 text-xl shadow-xl hover:shadow-2xl transition-all"
          onClick={() => navigate("/student/select-timing")}
        >
          <MessageCircleHeart className="w-8 h-8 mr-3" />
          Talk to Someone
        </Button>
      </div>

      <div className="bg-white/40 p-6 rounded-2xl text-center max-w-xs">
        <p className="text-sm text-[#3E5C35] italic">
          "Vulnerability sounds like truth and feels like courage."
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;
