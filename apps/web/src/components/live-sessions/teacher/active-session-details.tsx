'use client';

import { Clock } from 'lucide-react';
import type { LiveSession } from '@ocp/shared-types';

interface ActiveSessionDetailsProps {
  session: LiveSession;
}

/**
 * Идэвхтэй session-ийн мэдээлэл — видео доор харагдана.
 */
export function ActiveSessionDetails({ session }: ActiveSessionDetailsProps) {
  const startTime = new Date(session.scheduledStart).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(session.scheduledEnd).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const durationMinutes = Math.round(
    (new Date(session.scheduledEnd).getTime() - new Date(session.scheduledStart).getTime()) / 60000,
  );

  const statusLabel =
    session.status === 'live'
      ? 'Явагдаж байна'
      : session.status === 'scheduled'
        ? 'Товлогдсон'
        : session.status === 'ended'
          ? 'Дууссан'
          : 'Цуцлагдсан';

  const statusColor =
    session.status === 'live'
      ? 'bg-primary/20 text-primary'
      : session.status === 'scheduled'
        ? 'bg-slate-100 text-slate-500'
        : 'bg-slate-100 text-slate-400';

  return (
    <div className="rounded-xl border border-primary/10 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[200px] flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${statusColor}`}>
              {statusLabel}
            </span>
            <span className="text-xs font-medium text-slate-400">ID: {session.id.slice(0, 5)}</span>
          </div>
          <h3 className="mb-1 text-xl font-bold">{session.title}</h3>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <Clock className="size-3.5" />
            {startTime} - {endTime} ({durationMinutes} мин)
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{session.attendeeCount ?? 0}</p>
            <p className="text-[10px] font-bold uppercase text-slate-400">Оюутнууд</p>
          </div>
          <div className="h-10 w-px bg-primary/10" />
          <div className="text-center">
            <p className="text-2xl font-black text-primary">—</p>
            <p className="text-[10px] font-bold uppercase text-slate-400">Ирц</p>
          </div>
        </div>
      </div>
    </div>
  );
}
