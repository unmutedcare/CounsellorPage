import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useApp } from "../context/AppContext";
import { GraduationCap, HeartHandshake } from "lucide-react";

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const handleSelect = (role: "STUDENT" | "COUNSELOR") => {
    setRole(role);
    if (role === "STUDENT") {
      navigate("/student/login");
    } else {
      navigate("/counsellor/login");
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-green-300 via-green-200 to-yellow-200 flex items-center justify-center">
      <div className="flex flex-col items-center text-center space-y-8 animate-in slide-in-from-bottom-10 duration-500">
        <h2 className="text-3xl font-bold text-[#2d4026] font-serif">
          Choose Your Path
        </h2>

        <div className="w-full max-w-xs space-y-6">
          <Button
            fullWidth
            className="h-20 bg-[#507c52] hover:bg-[#3e6a42]"
            onClick={() => handleSelect("STUDENT")}
          >
            <GraduationCap className="mr-2" />
            Student
          </Button>

          <Button
            fullWidth
            className="h-20 bg-[#507c52] hover:bg-[#3e6a42]"
            onClick={() => handleSelect("COUNSELOR")}
          >
            <HeartHandshake className="mr-2" />
            Counsellor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
