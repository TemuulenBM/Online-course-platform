'use client';

import { Clock, Play, Download, User, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveSession } from '@ocp/shared-types';

interface SessionTimelineCardProps {
  session: LiveSession;
  /** Хэрэглэгч ирсэн эсэх (null = мэдэхгүй) */
  attended?: boolean | null;
}

/**
 * Timeline card — огноо block + status badge + гарчиг + actions.
 * Дизайны дагуу upcoming/past өнгөний ялгаатай.
 */
export function SessionTimelineCard({ session, attended }: SessionTimelineCardProps) {
  const isUpcoming = session.status === 'scheduled' || session.status === 'live';
  const isLive = session.status === 'live';
  const isPast = session.status === 'ended';
  const isCancelled = session.status === 'cancelled';

  const date = new Date(session.scheduledStart);
  const month = date.toLocaleDateString('mn-MN', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  const startTime = date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(session.scheduledEnd).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusLabel = isLive
    ? 'Live in 2 hours'
    : session.status === 'scheduled'
      ? 'Товлогдсон'
      : session.status === 'ended'
        ? 'Дууссан'
        : 'Цуцлагдсан';

  const statusColor = isLive
    ? 'bg-amber-100 text-amber-700'
    : session.status === 'scheduled'
      ? 'bg-primary/10 text-primary'
      : 'bg-slate-200 text-slate-600';

  return (
    <div
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border p-5 shadow-sm transition-all md:flex-row md:items-center',
        isPast || isCancelled
          ? 'border-primary/5 bg-white/60 opacity-80 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
          : 'border-primary/5 bg-white hover:border-primary/30 hover:shadow-md',
      )}
    >
      {/* Огноо block */}
      <div className="flex items-center gap-5">
        <div
          className={cn(
            'flex size-14 flex-col items-center justify-center rounded-xl border',
            isUpcoming
              ? 'border-primary/10 bg-primary/10 text-primary'
              : 'border-slate-200 bg-slate-100 text-slate-400',
          )}
        >
          <span className="text-xs font-bold uppercase tracking-wider">{month}</span>
          <span className="text-xl font-bold leading-none">{day}</span>
        </div>

        {/* Мэдээлэл */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className={cn(
                'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter',
                statusColor,
              )}
            >
              {statusLabel}
            </span>
            <h3
              className={cn(
                'text-lg font-bold transition-colors',
                isPast || isCancelled
                  ? 'text-slate-600'
                  : 'text-slate-800 group-hover:text-primary',
              )}
            >
              {session.title}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {startTime} - {endTime}
            </span>
            {session.instructorName && (
              <span className="flex items-center gap-1">
                <User className="size-3.5" /> {session.instructorName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Баруун тал — actions */}
      <div className="flex shrink-0 items-center gap-3 md:ml-auto">
        {/* Ирцийн badge */}
        {isPast && attended !== null && attended !== undefined && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold',
              attended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
            )}
          >
            {attended ? (
              <>
                <CheckCircle2 className="size-3.5" /> Ирсэн
              </>
            ) : (
              <>
                <XCircle className="size-3.5" /> Тасалсан
              </>
            )}
          </span>
        )}

        {/* Upcoming actions */}
        {isLive && (
          <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90">
            Нэгдэх
          </button>
        )}

        {session.status === 'scheduled' && (
          <button className="cursor-not-allowed rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-400">
            Хуанлид нэмэгдсэн
          </button>
        )}

        {/* Past actions — recording + download */}
        {isPast && session.recordingUrl && (
          <>
            <a
              href={session.recordingUrl}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <Play className="size-4" /> Бичлэг
            </a>
            <button className="rounded-xl bg-slate-100 p-2 text-slate-400 transition-colors hover:text-primary">
              <Download className="size-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
