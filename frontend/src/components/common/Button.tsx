import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  // Tactile Squash & Stretch, Fitts's Law touch target, high contrast focus
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-[6px] squash-stretch duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 select-none cursor-pointer';

  const sizeStyles = {
    sm: 'min-h-[36px] sm:min-h-[32px] px-3 py-1.5 text-xs gap-1.5',
    md: 'min-h-[44px] sm:min-h-[40px] px-4 py-2 text-sm gap-2', // Fitts's Law 44px on mobile
    lg: 'min-h-[48px] px-5 py-3 text-base gap-2.5 font-semibold',
  };

  const variantStyles = {
    // Primary Action / Accent: #2563EB (Royal Blue 600 - trust, authority, municipal clarity)
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#1D4ED8] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]',
    secondary: 'bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] hover:border-[#94A3B8] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]',
    outline: 'bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] hover:border-[#94A3B8]',
    danger: 'bg-[#DC2626] hover:bg-[#B91C1C] text-white border border-[#B91C1C] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]',
    ghost: 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100',
    success: 'bg-[#16A34A] hover:bg-[#15803D] text-white border border-[#15803D] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
