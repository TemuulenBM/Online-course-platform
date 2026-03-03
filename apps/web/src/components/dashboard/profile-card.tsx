'use client';

import { MoreVertical, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMyProfile, useMyProgress } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getFileUrl } from '@/lib/utils';

/** Долоо хоногийн өдрийн товчлол (Да=Mon, Ня=Sun) */
const WEEK_DAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

/** Role badge-ийн өнгө */
const roleBadgeStyle: Record<string, string> = {
  STUDENT: 'bg-primary/10 text-primary',
  TEACHER: 'bg-emerald-50 text-emerald-600',
  ADMIN: 'bg-amber-50 text-amber-600',
};

/**
 * Энэ долоо хоногийн (Да–Ня) хичээл дуусгасан тоог өдөр тус бүрд тооцоолно.
 * completedAt нь ISO date string байна.
 */
function getWeeklyCompletions(
  progressList: Array<{ completed: boolean; completedAt: string | null }>,
): number[] {
  const now = new Date();
  /** Энэ долоо хоногийн Даваа гарагийн эхлэл (0:00:00) */
  const dayOfWeek = now.getDay(); // 0=Ням, 6=Бям
  const mondayOffset = (dayOfWeek + 6) % 7; // Даваагаас хэдэн өдрийн өмнө
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const counts = Array(7).fill(0); // Да=0 ... Ня=6

  progressList.forEach((p) => {
    if (!p.completed || !p.completedAt) return;
    const completedDate = new Date(p.completedAt);
    const diffDays = Math.floor(
      (completedDate.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays >= 0 && diffDays < 7) {
      counts[diffDays]++;
    }
  });

  return counts;
}

export function ProfileCard() {
  const t = useTranslations('dashboard');
  const tr = useTranslations('roles');
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading } = useMyProfile();
  const { data: progressData } = useMyProgress({ page: 1, limit: 50 });

  /** Нэрийн эхний үсэг */
  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : (user?.email?.split('@')[0] ?? '');

  const roleKey = user?.role ?? 'STUDENT';

  /** Энэ долоо хоногийн хичээл дуусгасан тоо (өдөр тус бүр) */
  const weekCounts = getWeeklyCompletions(progressData?.data ?? []);
  const totalThisWeek = weekCounts.reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...weekCounts, 1);

  /** Өнөөдрийн индекс (Да=0 ... Ня=6) */
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="flex flex-col bg-card rounded-2xl p-6 border border-border shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
      {/* Профайл */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-bold text-foreground">{t('myProfile')}</h2>
        <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-2 pb-4 border-b border-border">
        {isLoading ? (
          <>
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-36 mb-2 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </>
        ) : (
          <>
            <div className="mb-4">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarImage src={getFileUrl(profile?.avatarUrl)} alt={fullName} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials || <User className="w-10 h-10" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-[19px] font-bold text-foreground mb-1">{fullName}</h3>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${roleBadgeStyle[roleKey] ?? 'bg-muted text-muted-foreground'}`}
            >
              {tr(roleKey)}
            </span>
          </>
        )}
      </div>

      {/* Идэвхийн график — энэ долоо хоногийн жинхэнэ өгөгдөл */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground mb-0.5">{t('activity')}</span>
            <span className="text-lg font-bold text-foreground">
              {totalThisWeek} {t('lessonsThisWeek')}
            </span>
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg">
            {t('weekly')}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-violet-300" />
            <span className="text-[10px] text-muted-foreground font-medium">{t('completed')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[repeating-linear-gradient(45deg,rgba(167,139,250,0.7),rgba(167,139,250,0.7)_3px,#A78BFA_3px,#A78BFA_6px)]" />
            <span className="text-[10px] text-muted-foreground font-medium">{t('today')}</span>
          </div>
        </div>

        {/* Bar chart — жинхэнэ өгөгдлөөр */}
        <div
          className="flex items-end justify-between gap-1 h-28"
          role="img"
          aria-label={t('activity')}
        >
          {WEEK_DAYS.map((day, i) => {
            const barHeight = Math.max(6, Math.round((weekCounts[i] / maxCount) * 104));
            const isToday = i === todayIdx;
            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-full max-w-[28px] rounded-lg transition-all hover:opacity-80 ${
                    isToday
                      ? 'bg-[repeating-linear-gradient(45deg,rgba(167,139,250,0.7),rgba(167,139,250,0.7)_3px,#A78BFA_3px,#A78BFA_6px)]'
                      : weekCounts[i] > 0
                        ? 'bg-violet-300'
                        : 'bg-muted'
                  }`}
                  style={{ height: `${barHeight}px` }}
                  title={`${day}: ${weekCounts[i]} хичээл`}
                />
                <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
