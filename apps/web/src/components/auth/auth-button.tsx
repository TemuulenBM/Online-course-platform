'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/** Auth хуудсуудын gradient pill товч */
export function AuthButton({
  children,
  isLoading,
  loadingText,
  variant = 'primary',
  icon,
  iconPosition = 'right',
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={cn(
        'w-full py-3.5 rounded-full font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70',
        variant === 'primary' &&
          'bg-gradient-to-r from-[#8A93E5] to-[#9575ED] text-white shadow-lg shadow-[#8A93E5]/25 hover:shadow-[#8A93E5]/40',
        variant === 'outline' &&
          'border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
}
