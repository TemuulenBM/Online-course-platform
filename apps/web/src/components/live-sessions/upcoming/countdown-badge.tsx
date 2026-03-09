'use client';

import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountdown } from '@/hooks/use-countdown';

interface CountdownBadgeProps {
  /** Session эхлэх хугацаа (ISO 8601) */
  targetDate: string;
  /** Session статус — 'live' бол ШУУД badge харуулна */
  status?: string;
  /** Compact горим — зөвхөн цаг:мин:сек */
  compact?: boolean;
  className?: string;
}

/**
 * Бодит цагийн countdown badge.
 * Ойртох тусам өнгө шилжинэ: slate → amber → red.
 * LIVE session бол "ШУУД НЭВТРҮҮЛЖ БАЙНА" badge харуулна.
 */
export function CountdownBadge({ targetDate, status, compact, className }: CountdownBadgeProps) {
  const { formatted, isUrgent, isImminent, isExpired } = useCountdown(targetDate);

  /** LIVE session — ШУУД badge */
  if (status === 'live') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
          'bg-red-500 text-white',
          className,
        )}
      >
        <span className="size-1.5 animate-pulse rounded-full bg-white" />
        {compact ? 'ШУУД' : 'ШУУД НЭВТРҮҮЛЖ БАЙНА'}
      </span>
    );
  }

  if (isExpired) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
          'bg-red-500/10 text-red-600',
          className,
        )}
      >
        <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
        Тун удахгүй
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tabular-nums transition-colors duration-500',
        isImminent
          ? 'bg-red-500/10 text-red-600'
          : isUrgent
            ? 'bg-amber-500/10 text-amber-600'
            : 'bg-slate-100 text-slate-600',
        className,
      )}
    >
      {!compact && <Timer className="size-3.5" />}
      {formatted}
    </span>
  );
}
