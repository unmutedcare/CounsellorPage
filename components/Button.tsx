import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'counselor-primary' | 'counselor-secondary';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-7 py-2 rounded-full font-bold text-lg transition-transform active:scale-70 shadow-lg flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#7CAB48] text-white hover:bg-[#6a943e]", // Muted green (Student)
    secondary: "bg-[#5B8C5A] text-white hover:bg-[#4a7349]", // Darker green
    outline: "border-2 border-[#7CAB48] text-[#7CAB48] bg-transparent hover:bg-[#7CAB48]/10",
    ghost: "bg-transparent text-gray-600 shadow-none hover:bg-black/5",
    
    // Counselor specific colors based on screenshot
    'counselor-primary': "bg-orange-500 text-white hover:bg-orange-600",
    'counselor-secondary': "bg-[#6BCB77] text-white hover:bg-[#5ab565]", // Fresh green
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;