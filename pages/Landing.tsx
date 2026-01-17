import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { Leaf } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center animate-in fade-in duration-700">
      <div className="mb-8 p-6 bg-white/20 rounded-full backdrop-blur-md shadow-xl animate-bounce-slow">
        <Leaf size={64} className="text-[#5B8C5A]" />
      </div>
      
      <h1 className="text-5xl font-extrabold text-[#3E5C35] mb-2 tracking-tight">Unmuted</h1>
      <p className="text-lg text-[#5B8C5A] mb-12 font-medium">Find your voice. Find your peace.</p>

      <div className="w-full max-w-xs">
        <Button onClick={() => navigate('/role-select')} fullWidth>
          Get Started
        </Button>
      </div>
      
      {/* Decorative background elements imitating the floating leaves in screenshot */}
      <div className="fixed top-20 left-10 opacity-20 pointer-events-none">
         <Leaf size={24} className="text-[#5B8C5A] rotate-45" />
      </div>
      <div className="fixed bottom-32 right-10 opacity-20 pointer-events-none">
         <Leaf size={32} className="text-[#5B8C5A] -rotate-12" />
      </div>
    </div>
  );
};

export default Landing;