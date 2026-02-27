'use client';

import type { SessionAttendee } from '@ocp/shared-types';
import { CircularTimer } from './circular-timer';
import { ParticipantsList } from './participants-list';

interface SessionInfoSidebarProps {
  /** Өнгөрсөн хугацаа секундаар */
  elapsedSeconds: number;
  /** Нийт үргэлжлэх хугацаа минутаар */
  durationMinutes: number;
  /** Оролцогчид */
  attendees: SessionAttendee[];
  /** Багшийн нэр */
  instructorName?: string;
}

/**
 * Баруун sidebar — Circular timer + Оролцогчид + Чат.
 */
export function SessionInfoSidebar({
  elapsedSeconds,
  durationMinutes,
  attendees,
  instructorName,
}: SessionInfoSidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-6 lg:w-80">
      {/* Session progress */}
      <div className="rounded-xl border border-primary/5 bg-white p-5 shadow-sm">
        <h4 className="mb-4 text-lg font-bold">Хичээлийн явц</h4>
        <CircularTimer elapsedSeconds={elapsedSeconds} totalMinutes={durationMinutes} />
      </div>

      {/* Оролцогчид + Чат */}
      <ParticipantsList attendees={attendees} instructorName={instructorName} />
    </aside>
  );
}
