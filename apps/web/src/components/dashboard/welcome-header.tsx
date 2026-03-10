'use client';

import { useState, useEffect } from 'react';
import { Flame, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMyProfile } from '@/hooks/api';
import { useStreak } from '@/hooks/use-streak';
import { useAuthStore } from '@/stores/auth-store';
import { NotificationBell } from '@/components/notifications/notification-bell';

/** Цагаас хамаарсан мэндчилгээний translation key буцаана */
function getTimeGreetingKey(): 'morningGreeting' | 'afternoonGreeting' | 'eveningGreeting' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morningGreeting';
  if (hour < 18) return 'afternoonGreeting';
  return 'eveningGreeting';
}

interface WelcomeHeaderProps {
  /** Идэвхтэй элсэлтийн тоо — contextual nudge-д ашиглана */
  activeCount?: number;
}

export function WelcomeHeader({ activeCount }: WelcomeHeaderProps) {
  const t = useTranslations('dashboard');
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const streakCount = useStreak();

  /** SSR hydration mismatch-ээс зайлсхийхийн тулд client-side only */
  const [timeGreeting, setTimeGreeting] = useState<string | null>(null);
  useEffect(() => {
    setTimeGreeting(t(getTimeGreetingKey()));
  }, [t]);

  /** Хэрэглэгчийн нэрийг авах — profile firstName эсвэл email-ийн @ өмнөх хэсэг */
  const displayName = profile?.firstName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          {/* Гар утасны sidebar trigger */}
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            {t('welcomeBack', { name: displayName })}
          </h1>

          {/* Streak тоолуур — retention-ийн гол элемент */}
          {streakCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/15 dark:to-amber-500/15 border border-orange-200/50 dark:border-orange-500/20 rounded-xl">
              <Flame
                className="w-4 h-4 text-orange-500"
                style={{ animation: 'flicker 1.5s ease-in-out infinite' }}
              />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {t('streakDays', { count: streakCount })}
              </span>
            </div>
          )}
        </div>

        {/* Цагаас хамаарсан мэндчилгээ + contextual nudge */}
        {timeGreeting && (
          <p className="text-sm text-muted-foreground ml-0 md:ml-0">
            {timeGreeting}
            {activeCount !== undefined && activeCount > 0 && (
              <span className="ml-2 text-muted-foreground/80">
                · {t('coursesInProgress', { count: activeCount })}
              </span>
            )}
            {activeCount === 0 && (
              <span className="ml-2 text-muted-foreground/80">· {t('noCourseYet')}</span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Хайлтын талбар */}
        <div className="relative">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm w-full sm:w-[260px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Мэдэгдлийн товч — dropdown-тэй */}
        <NotificationBell />
      </div>
    </div>
  );
}
