'use client';

import { Settings, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveSession } from '@ocp/shared-types';

interface SessionListCardProps {
  session: LiveSession;
  onOpen?: () => void;
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Sidebar дахь session card — status badge + title + time + actions.
 */
export function SessionListCard({
  session,
  onOpen,
  onStart,
  onEdit,
  onDelete,
}: SessionListCardProps) {
  const isLive = session.status === 'live';
  const isScheduled = session.status === 'scheduled';

  const startTime = new Date(session.scheduledStart).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(session.scheduledEnd).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all hover:shadow-md',
        isLive
          ? 'border-primary/20 bg-primary/5'
          : 'border-slate-100 bg-white hover:border-primary/30',
      )}
    >
      {/* Header: status + ID */}
      <div className="mb-2 flex items-start justify-between">
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
            isLive ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500',
          )}
        >
          {isLive ? 'LIVE' : 'Товлогдсон'}
        </span>
        <span className="text-[10px] font-bold text-slate-400">#{session.id.slice(0, 5)}</span>
      </div>

      {/* Title + Time */}
      <h5 className="mb-1 text-sm font-bold leading-tight">{session.title}</h5>
      <p className="mb-3 text-xs text-slate-500">
        {startTime} - {endTime}
        {session.attendeeCount ? ` • ${session.attendeeCount} суралцагч` : ''}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        {isLive ? (
          <>
            <button
              onClick={onOpen}
              className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-white transition-colors hover:bg-primary/90"
            >
              Нээх
            </button>
            <button onClick={onEdit} className="rounded-lg bg-slate-100 px-2 text-slate-600">
              <Settings className="size-4" />
            </button>
          </>
        ) : isScheduled ? (
          <>
            <button
              onClick={onStart}
              className="flex-1 rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
            >
              Эхлүүлэх
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="rounded-lg border border-slate-200 px-2 py-2 text-slate-400 transition-colors hover:border-red-200 hover:text-red-500"
              >
                <Trash2 className="size-4" />
              </button>
            )}
            <button
              onClick={onEdit}
              className="rounded-lg border border-slate-200 px-2 py-2 text-slate-400 transition-colors hover:border-primary/20 hover:text-primary"
            >
              <Pencil className="size-4" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
