'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  /** Label-ийн баруун талд харуулах элемент (жнь: "Нууц үг мартсан?" link) */
  labelRight?: React.ReactNode;
}

/** Pill хэлбэртэй auth input — left/right icon, hint, error дэмжинэ */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, onRightIconClick, labelRight, className, ...props },
    ref,
  ) => {
    return (
      <div className="space-y-1.5">
        {/* Label */}
        {(label || labelRight) && (
          <div className="flex items-center justify-between">
            {label && (
              <label htmlFor={props.id} className="text-sm font-semibold text-gray-700">
                {label}
              </label>
            )}
            {labelRight && <div>{labelRight}</div>}
          </div>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Зүүн icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full px-5 py-3.5 rounded-full bg-gray-100 border border-gray-200 transition-all duration-200 outline-none text-gray-900 placeholder:text-gray-400 font-medium text-sm',
              'focus:border-[#8A93E5] focus:ring-2 focus:ring-[#8A93E5]/20 focus:bg-white',
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              error && 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50',
              props.disabled && 'opacity-60 cursor-not-allowed',
              className,
            )}
            {...props}
          />

          {/* Баруун icon */}
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              tabIndex={-1}
              disabled={props.disabled}
            >
              {rightIcon}
            </button>
          )}
        </div>

        {/* Hint текст */}
        {hint && !error && <p className="text-gray-400 text-xs italic ml-1">{hint}</p>}

        {/* Error текст */}
        {error && <p className="text-red-500 text-xs font-medium ml-1">{error}</p>}
      </div>
    );
  },
);

AuthInput.displayName = 'AuthInput';
