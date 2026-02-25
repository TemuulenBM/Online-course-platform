'use client';

import Link from 'next/link';
import { GraduationCap, Loader2, ShoppingCart } from 'lucide-react';
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

  /** Нэвтрээгүй */
  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <Link href={ROUTES.LOGIN}>
          <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
            <ShoppingCart className="size-4" />
            {isFree ? t('freeEnroll') : t('buyNow')}
          </button>
        </Link>
        <Link href={ROUTES.LOGIN}>
          <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
            <GraduationCap className="size-4" />
            {t('enrollNow')}
          </button>
        </Link>
      </div>
    );
  }

  if (checkLoading) return <Skeleton className="h-[108px] w-full rounded-xl" />;

  /** Элссэн */
  if (enrollmentCheck?.isEnrolled) {
    const status = enrollmentCheck.enrollment?.status;

    if (status === 'completed') {
      return (
        <button
          disabled
          className="w-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 py-4 rounded-xl font-bold text-sm"
        >
          {t('completed')}
        </button>
      );
    }

    return (
      <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
        <GraduationCap className="size-4" />
        {t('continue')}
      </button>
    );
  }

  /** Элсээгүй */
  return (
    <div className="space-y-3">
      {!isFree && (
        <button
          onClick={() => enrollMutation.mutate(courseId)}
          disabled={enrollMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {enrollMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t('enrolling')}
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" />
              {t('buyNow')}
            </>
          )}
        </button>
      )}
      <button
        onClick={() => enrollMutation.mutate(courseId)}
        disabled={enrollMutation.isPending}
        className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {enrollMutation.isPending && isFree ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t('enrolling')}
          </>
        ) : (
          <>
            <GraduationCap className="size-4" />
            {isFree ? t('freeEnroll') : t('enrollNow')}
          </>
        )}
      </button>
    </div>
  );
}
