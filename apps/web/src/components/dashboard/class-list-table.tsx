'use client';

import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useMyEnrollments } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { MiniProgressRing } from '@/components/dashboard/mini-progress-ring';
import { ROUTES } from '@/lib/constants';

/** Card stagger variants */
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/**
 * updatedAt огноогоор "last seen" текст гаргана.
 * Retention — сурагчид "хэдэн хоногийн өмнө" мэдээлэл → urgency
 */
function getLastSeenText(
  updatedAt: string,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const now = new Date();
  const updated = new Date(updatedAt);
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('lastSeenToday');
  if (diffDays === 1) return t('lastSeenYesterday');
  return t('lastSeen', { days: diffDays });
}

export function ClassListTable() {
  const t = useTranslations('dashboard');
  const tp = useTranslations('profile');

  const { data: enrollments, isLoading } = useMyEnrollments({ page: 1, limit: 5 });

  const items = enrollments?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground tracking-tight">{t('activeCourses')}</h2>
        <Link
          href={ROUTES.MY_COURSES}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t('seeAll')}
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card"
            >
              <Skeleton className="w-16 h-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/3 rounded-lg" />
              </div>
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={tp('noEnrollments')}
          action={{ label: tp('browseCourses'), href: ROUTES.COURSES }}
          className="py-12 bg-card rounded-2xl border border-border"
        />
      ) : (
        <motion.div
          className="flex flex-col gap-3"
          variants={listContainer}
          initial="hidden"
          animate="show"
        >
          {items.map((enrollment) => {
            const status = enrollment.status;
            const progressPercent = status === 'completed' ? 100 : 0;

            return (
              <motion.div key={enrollment.id} variants={listItem}>
                <Link
                  href={
                    enrollment.courseSlug
                      ? ROUTES.COURSE_DETAIL(enrollment.courseSlug)
                      : ROUTES.COURSES
                  }
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                    {enrollment.courseThumbnailUrl ? (
                      <Image
                        src={enrollment.courseThumbnailUrl}
                        alt={enrollment.courseTitle ?? ''}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Мэдээлэл */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {enrollment.courseTitle ?? 'Untitled Course'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {enrollment.courseInstructorName && (
                        <span className="text-xs text-muted-foreground">
                          {enrollment.courseInstructorName}
                        </span>
                      )}
                      {/* Last seen — retention urgency */}
                      {enrollment.updatedAt && (
                        <>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-[11px] text-muted-foreground/60">
                            {getLastSeenText(enrollment.updatedAt, t)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress ring */}
                  <div className="shrink-0">
                    <MiniProgressRing percentage={progressPercent} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
