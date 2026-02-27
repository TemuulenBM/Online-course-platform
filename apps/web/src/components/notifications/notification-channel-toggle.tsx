'use client';

import type { LucideIcon } from 'lucide-react';
import { Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationChannelToggleProps {
  /** Сувгийн icon */
  icon: LucideIcon;
  /** Сувгийн нэр */
  title: string;
  /** Сувгийн тайлбар */
  description: string;
  /** Идэвхтэй эсэх */
  enabled: boolean;
  /** Түгжигдсэн эсэх (In-app гэх мэт заавал идэвхтэй суваг) */
  locked?: boolean;
  /** API дуудлага хийж байгаа эсэх */
  loading?: boolean;
  /** Toggle солигдох үед дуудагдах */
  onToggle: (value: boolean) => void;
}

/** Мэдэгдлийн суваг бүрийн toggle row — дизайнд тааруулсан */
export function NotificationChannelToggle({
  icon: Icon,
  title,
  description,
  enabled,
  locked = false,
  loading = false,
  onToggle,
}: NotificationChannelToggleProps) {
  const isDisabled = locked || loading;

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-5 justify-between rounded-lg transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0',
        locked
          ? 'opacity-70 bg-slate-50/50 dark:bg-slate-800/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
      )}
    >
      {/* Icon + текст */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex items-center justify-center rounded-xl shrink-0 size-12',
            enabled
              ? 'bg-primary/10 text-primary'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500',
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col">
          <p className="text-slate-900 dark:text-slate-100 text-base font-semibold">{title}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
        </div>
      </div>

      {/* Toggle switch */}
      <div className="shrink-0 flex items-center gap-2">
        {locked && <Lock className="size-4 text-slate-400" />}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={isDisabled}
          onClick={() => onToggle(!enabled)}
          className={cn(
            'relative flex h-8 w-14 items-center rounded-full p-1 transition-colors',
            enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700',
            locked && 'bg-primary/50 cursor-not-allowed',
            loading && 'cursor-wait',
            !isDisabled && 'cursor-pointer',
          )}
        >
          <span
            className={cn(
              'h-6 w-6 rounded-full bg-white shadow-sm transition-transform',
              enabled ? 'translate-x-6' : 'translate-x-0',
            )}
          >
            {loading && (
              <Loader2 className="size-4 animate-spin text-primary absolute top-1 left-1" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
