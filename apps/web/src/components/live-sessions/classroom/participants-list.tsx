'use client';

import { Mic, MicOff } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { SessionAttendee } from '@ocp/shared-types';

interface ParticipantsListProps {
  attendees: SessionAttendee[];
  instructorName?: string;
}

/**
 * Оролцогчдын жагсаалт — instructor highlighted, микрофон статус.
 */
export function ParticipantsList({ attendees, instructorName = 'Багш' }: ParticipantsListProps) {
  return (
    <div className="flex min-h-[400px] flex-1 flex-col rounded-xl border border-primary/5 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-primary/5 p-5">
        <h4 className="font-bold">Оролцогчид</h4>
        <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
          {attendees.length}
        </span>
      </div>

      {/* List */}
      <div className="max-h-[500px] flex-1 space-y-4 overflow-y-auto p-4">
        {/* Instructor */}
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-primary">
            <AvatarFallback className="bg-primary/20 text-sm font-bold text-primary">
              {instructorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-bold">{instructorName}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Багш</p>
          </div>
          <Mic className="size-4 text-primary" />
        </div>

        {/* Attendees */}
        {attendees.map((a) => (
          <div key={a.id} className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-slate-200 text-sm font-medium">
                {(a.userName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{a.userName || 'Оюутан'}</p>
              <p className="text-[10px] text-slate-400">Оюутан</p>
            </div>
            <MicOff className="size-4 text-slate-300" />
          </div>
        ))}

        {attendees.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">Одоогоор оролцогч алга</p>
        )}
      </div>

      {/* Chat input */}
      <div className="rounded-b-xl bg-slate-50 p-4">
        <div className="relative">
          <input
            className="w-full rounded-lg border-none bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:ring-2 focus:ring-primary/50"
            placeholder="Чат бичих..."
            type="text"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
