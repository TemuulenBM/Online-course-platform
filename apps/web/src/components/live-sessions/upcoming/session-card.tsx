'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LiveSession } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';
import { CountdownBadge } from './countdown-badge';

interface SessionCardProps {
  session: LiveSession;
}

/**
 * Grid session card — 3-column grid дотор.
 * Thumbnail + countdown overlay + category + title + instructor + CTA.
 */
export function SessionCard({ session }: SessionCardProps) {
  const initials = session.instructorName
    ? session.instructorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'Б';

  return (
    <div className="group overflow-hidden rounded-2xl border border-primary/10 bg-white transition-all hover:border-primary/30 hover:shadow-lg">
      {/* Thumbnail placeholder */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
        <div className="flex h-full items-center justify-center">
          <span className="text-4xl font-black text-white/30">LIVE</span>
        </div>
        {/* Countdown overlay */}
        <div className="absolute bottom-2 right-2">
          <CountdownBadge
            targetDate={session.scheduledStart}
            compact
            className="bg-black/60 text-white backdrop-blur-md"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {session.courseTitle && (
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
            {session.courseTitle}
          </div>
        )}

        <h4 className="mb-4 line-clamp-1 text-lg font-bold">{session.title}</h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
              {initials}
            </div>
            <span className="text-xs text-slate-600">{session.instructorName || 'Багш'}</span>
          </div>
          {session.attendeeCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Eye className="size-3.5" />
              <span>{session.attendeeCount} хүлээж буй</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button
            asChild
            variant="ghost"
            className="w-full rounded-xl bg-primary/10 font-bold text-primary hover:bg-primary hover:text-white"
          >
            <Link href={ROUTES.LIVE_CLASSROOM(session.id)}>Үзэх</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
