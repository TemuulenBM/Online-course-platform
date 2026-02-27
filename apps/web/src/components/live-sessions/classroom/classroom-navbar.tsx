'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROUTES } from '@/lib/constants';

interface ClassroomNavbarProps {
  onLeave?: () => void;
  userName?: string;
}

/**
 * Минимал navbar — Logo + Гарах товч + хэрэглэгчийн avatar.
 */
export function ClassroomNavbar({ onLeave, userName }: ClassroomNavbarProps) {
  const initials = userName
    ? userName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ME';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/10 bg-white/80 px-6 py-3 backdrop-blur-sm">
      <Link href={ROUTES.LIVE_SESSIONS} className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
          <BookOpen className="size-4" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Learnify</h2>
      </Link>

      <div className="flex items-center gap-4">
        <Button
          onClick={onLeave}
          className="rounded-xl bg-primary px-6 font-bold hover:bg-primary/90"
        >
          Гарах
        </Button>
        <Avatar className="size-10 ring-2 ring-primary/20">
          <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
