'use client';

import Link from 'next/link';
import {
  Gift,
  ShoppingCart,
  PlayCircle,
  Award,
  Clock,
  ChevronRight,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCheckEnrollment, useEnroll, useCourseProgress } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

interface CourseEnrollButtonProps {
  courseId: string;
  isFree: boolean;
}

/** Элсэлтийн state card — sidebar дотор 5 state харуулна */
export function CourseEnrollButton({ courseId, isFree }: CourseEnrollButtonProps) {
  const t = useTranslations('courses');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: enrollmentCheck, isLoading: checkLoading } = useCheckEnrollment(
    isAuthenticated ? courseId : '',
  );
  const enrollMutation = useEnroll();

  const isEnrolled = enrollmentCheck?.isEnrolled;
  const enrollmentStatus = enrollmentCheck?.enrollment?.status;

  /** Progress — зөвхөн active элсэлтэд */
  const { data: progress } = useCourseProgress(
    isEnrolled && enrollmentStatus === 'active' ? courseId : '',
  );
  const progressPercentage = progress?.courseProgressPercentage ?? 0;

  /** Элсэх */
  const handleEnroll = () => {
    enrollMutation.mutate(courseId, {
      onSuccess: () => {
        toast.success('Амжилттай элсэлт хийгдлээ');
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Алдаа гарлаа');
      },
    });
  };

  /** Нэвтрээгүй */
  if (!isAuthenticated) {
    return (
      <Link href={ROUTES.LOGIN}>
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
          {isFree ? (
            <>
              <Gift className="size-4" />
              {t('freeEnroll')}
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" />
              {t('buyNow')}
            </>
          )}
        </button>
      </Link>
    );
  }

  if (checkLoading) return <Skeleton className="h-[80px] w-full rounded-xl" />;

  /** Элссэн — Active */
  if (isEnrolled && enrollmentStatus === 'active') {
    return (
      <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-xl border border-primary/20">
        <div className="flex items-center gap-4 mb-3">
          <div className="size-12 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
            <PlayCircle className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm">Сургалт идэвхтэй байна</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>
        <button className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          {t('continue')}
          <ChevronRight className="size-4" />
        </button>
      </div>
    );
  }

  /** Элссэн — Completed */
  if (isEnrolled && enrollmentStatus === 'completed') {
    const completedDate = enrollmentCheck?.enrollment?.completedAt
      ? new Date(enrollmentCheck.enrollment.completedAt).toLocaleDateString('mn-MN')
      : '';
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
        <div className="flex items-center gap-4 mb-3">
          <div className="size-12 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Award className="size-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Баяр хүргэе!</h4>
            <p className="text-slate-500 text-xs mt-0.5">Та энэ сургалтыг амжилттай дуусгасан.</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="size-3.5" />
            Дууссан
          </span>
          {completedDate && <span className="text-xs text-slate-400">Огноо: {completedDate}</span>}
        </div>
      </div>
    );
  }

  /** Элссэн — Expired/Cancelled */
  if (isEnrolled && (enrollmentStatus === 'expired' || enrollmentStatus === 'cancelled')) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 opacity-75">
        <div className="flex items-center gap-4 mb-3">
          <div className="size-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
            <Clock className="size-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Элсэлтийн хугацаа дууссан</h4>
            <p className="text-slate-500 text-xs mt-0.5">
              Таны элсэлт цуцлагдсан эсвэл дууссан байна.
            </p>
          </div>
        </div>
        <button
          onClick={handleEnroll}
          disabled={enrollMutation.isPending}
          className="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {enrollMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t('enrolling')}
            </>
          ) : (
            'Дахин элсэх'
          )}
        </button>
      </div>
    );
  }

  /** Элсээгүй — Free эсвэл Paid */
  return (
    <button
      onClick={handleEnroll}
      disabled={enrollMutation.isPending}
      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 flex items-center justify-center gap-2"
    >
      {enrollMutation.isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {t('enrolling')}
        </>
      ) : isFree ? (
        <>
          <Gift className="size-4" />
          {t('freeEnroll')}
        </>
      ) : (
        <>
          <ShoppingCart className="size-4" />
          {t('buyNow')}
        </>
      )}
    </button>
  );
}
