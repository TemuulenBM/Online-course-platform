'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  change?: number;
  className?: string;
}

/** Аналитик stat card — icon, label, value, change badge */
export function StatCard({ label, value, icon, change, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 hover:shadow-lg transition-shadow group',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'text-xs font-bold px-2 py-1 rounded-full',
              change >= 0
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                : 'text-rose-500 bg-rose-50 dark:bg-rose-500/10',
            )}
          >
            {change >= 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

interface SecondaryStatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
}

/** Хоёрдогч stat card — icon + label + value нэг мөрөнд */
export function SecondaryStatCard({
  label,
  value,
  icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-blue-500',
}: SecondaryStatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10 flex items-center gap-4">
      <div
        className={cn('size-12 rounded-full flex items-center justify-center', iconBg, iconColor)}
      >
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
    </div>
  );
}
