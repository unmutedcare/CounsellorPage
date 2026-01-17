
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';
import { GraduationCap, HeartHandshake } from 'lucide-react';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const handleRoleSelect = (role: 'STUDENT' | 'COUNSELOR') => {
    setRole(role);
    navigate('/auth');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-8 animate-in slide-in-from-bottom-10 duration-500">
      <h2 className="text-3xl font-bold text-[#2d4026] mb-4 font-serif tracking-wide">Choose Your Path</h2>
      
      <div className="w-full max-w-xs space-y-6">
       

        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => handleRoleSelect('COUNSELOR')}
          className="h-20 bg-[#507c52]"
        >
          <HeartHandshake className="mr-2" />
          Counsellor
        </Button>
      </div>
    </div>
  );
};

export default RoleSelection;
