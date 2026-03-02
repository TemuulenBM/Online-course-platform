'use client';

import Link from 'next/link';
import { Users, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { LiveSession } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';
import { CountdownBadge } from './countdown-badge';

interface FeaturedSessionCardProps {
  session: LiveSession;
}

/**
 * Hero card — хамгийн ойрын live session.
 * Дизайны адилаар зураг + session мэдээлэл хажуу хажуу.
 */
export function FeaturedSessionCard({ session }: FeaturedSessionCardProps) {
  const initials = session.instructorName
    ? session.instructorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'Б';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-xl shadow-primary/5 md:flex-row">
      {/* Зүүн тал: Зургийн placeholder */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/30 to-slate-800 md:h-auto md:w-2/5">
        <div className="absolute inset-0 z-10 bg-primary/20 transition-colors group-hover:bg-primary/10" />
        <div className="absolute left-4 top-4 z-20">
          <CountdownBadge targetDate={session.scheduledStart} className="bg-red-600 text-white" />
        </div>
        {/* Placeholder pattern */}
        <div className="flex h-full items-center justify-center">
          <div className="text-6xl font-black text-white/10">LIVE</div>
        </div>
      </div>

      {/* Баруун тал: Мэдээлэл */}
      <div className="flex flex-col justify-center p-8 md:w-3/5">
        <div className="mb-4 flex items-center gap-2">
          {session.courseTitle && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {session.courseTitle}
            </span>
          )}
          <span className="text-sm text-slate-400">•</span>
          <CountdownBadge targetDate={session.scheduledStart} compact />
        </div>

        <h3 className="mb-4 text-2xl font-bold transition-colors group-hover:text-primary">
          {session.title}
        </h3>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{session.instructorName || 'Багш'}</span>
          </div>
          {session.attendeeCount !== undefined && (
            <div className="flex items-center gap-1 text-slate-500">
              <Users className="size-4" />
              <span className="text-sm">{session.attendeeCount} үзэгч</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="rounded-xl bg-primary px-8 py-3 font-bold hover:shadow-lg hover:shadow-primary/30"
          >
            <Link href={ROUTES.LIVE_CLASSROOM(session.id)}>Нэгдэх</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl border-primary/20 text-primary hover:bg-primary/5"
          >
            <Share2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
