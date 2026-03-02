'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientStatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'primary' | 'light';
  icon?: ReactNode;
}

/** Gradient stat card — admin dashboard-д сарын онцлох үзүүлэлт */
export function GradientStatCard({
  label,
  value,
  subtitle,
  variant = 'light',
  icon,
}: GradientStatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden p-8 rounded-3xl',
        variant === 'primary'
          ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
          : 'bg-white dark:bg-slate-900 border border-primary/10',
      )}
    >
      <div className="relative z-10">
        <p
          className={cn(
            'text-sm font-medium mb-1',
            variant === 'primary' ? 'text-white/80' : 'text-slate-500',
          )}
        >
          {label}
        </p>
        <h3
          className={cn(
            'text-4xl font-black mb-4',
            variant === 'primary' ? 'text-white' : 'text-slate-900 dark:text-white',
          )}
        >
          {value}
        </h3>
        {subtitle && (
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            {subtitle}
          </div>
        )}
      </div>
      {icon && (
        <div
          className={cn(
            'absolute -right-4 -bottom-4 opacity-5 pointer-events-none',
            variant === 'primary' ? 'opacity-10' : '',
          )}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
