import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'action' | 'luxury';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-8 py-3 rounded-full font-bold transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#10b981] text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02]",
    secondary: "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white",
    outline: "border border-[#10b981]/50 text-[#10b981] bg-transparent hover:bg-[#10b981]/10",
    ghost: "bg-transparent text-white/40 hover:text-white hover:bg-white/5 shadow-none",
    action: "bg-[#6366f1] text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-[1.02]",
    luxury: "font-luxury text-[10px] tracking-[0.3em] uppercase bg-white text-black hover:bg-white/90",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
