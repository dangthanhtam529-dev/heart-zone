import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-orange-400 to-rose-400 text-white hover:shadow-lg hover:shadow-orange-200/50 border border-transparent",
    secondary: "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm",
    danger: "bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100",
    ghost: "bg-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-100"
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