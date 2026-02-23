'use client';

import Link from 'next/link';
import { Loader2, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCheckEnrollment, useEnroll } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

interface CourseEnrollButtonProps {
  courseId: string;
  isFree: boolean;
}

/** Элсэлтийн товч — нэвтрээгүй/элссэн/элсэх 3 state */
export function CourseEnrollButton({ courseId, isFree }: CourseEnrollButtonProps) {
  const t = useTranslations('courses');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: enrollmentCheck, isLoading: checkLoading } = useCheckEnrollment(
    isAuthenticated ? courseId : '',
  );
  const enrollMutation = useEnroll();

  // Нэвтрээгүй
  if (!isAuthenticated) {
    return (
      <Link href={ROUTES.LOGIN}>
        <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
          <ShoppingCart className="size-4" />
          {isFree ? t('freeEnroll') : t('enrollNow')}
        </button>
      </Link>
    );
  }

  if (checkLoading) return <Skeleton className="h-12 w-full rounded-xl" />;

  // Элссэн
  if (enrollmentCheck?.isEnrolled) {
    const status = enrollmentCheck.enrollment?.status;

    if (status === 'completed') {
      return (
        <button
          disabled
          className="w-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 py-3.5 rounded-xl font-bold text-sm"
        >
          {t('completed')}
        </button>
      );
    }

    return (
      <button className="w-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
        {t('continue')}
      </button>
    );
  }

  // Элсээгүй
  return (
    <button
      onClick={() => enrollMutation.mutate(courseId)}
      disabled={enrollMutation.isPending}
      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
    >
      {enrollMutation.isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {t('enrolling')}
        </>
      ) : (
        <>
          <ShoppingCart className="size-4" />
          {isFree ? t('freeEnroll') : t('enrollNow')}
        </>
      )}
    </button>
  );
}
