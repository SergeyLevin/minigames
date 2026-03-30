import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: React.MouseEventHandler<HTMLDivElement> }> = ({ children, className, onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white rounded-[24px] border-2 border-[#E5E7EB] p-4 shadow-sm active:scale-[0.98] transition-transform",
      "border-blue-100", // Голубая обводка по ТЗ
      className
    )}
  >
    {children}
  </div>
);

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  onClick,
  disabled
}: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const variants = {
    primary: "bg-[#007AFF] text-white",
    secondary: "bg-[#F3F4F6] text-[#1F2937]",
    outline: "border-2 border-[#007AFF] text-[#007AFF]"
  };

  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full py-4 px-6 rounded-[18px] font-semibold text-lg transition-all active:opacity-80 disabled:opacity-50",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("px-3 py-1 bg-blue-50 text-[#007AFF] text-xs font-bold rounded-full uppercase tracking-wider", className)}>
    {children}
  </span>
);
