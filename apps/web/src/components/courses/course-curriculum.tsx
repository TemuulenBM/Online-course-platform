'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCourseLessons, useCheckEnrollment, useEnroll } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseCurriculumItem } from './course-curriculum-item';

interface CourseCurriculumProps {
  courseId: string;
  slug?: string;
}

/** Хичээлийн хөтөлбөр жагсаалт — шинэ дизайн */
export function CourseCurriculum({ courseId, slug }: CourseCurriculumProps) {
  const t = useTranslations('courses');
  const tLesson = useTranslations('lessonViewer');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: lessons, isLoading } = useCourseLessons(courseId);
  const { data: enrollmentCheck } = useCheckEnrollment(isAuthenticated ? courseId : '');
  const enrollMutation = useEnroll();
  const isEnrolled = enrollmentCheck?.isEnrolled ?? false;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 pt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!lessons?.length) {
    return (
      <div className="pt-6 text-center text-slate-500 py-10">{t('lessonCount', { count: 0 })}</div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <span className="text-sm text-slate-500 font-medium mb-1">
        {t('lessonCount', { count: lessons.length })}
      </span>

      <div className="space-y-4">
        {lessons.map((lesson, idx) => (
          <CourseCurriculumItem
            key={lesson.id}
            lesson={lesson}
            index={idx + 1}
            slug={slug}
            isEnrolled={isEnrolled}
          />
        ))}
      </div>

      {/* Enrollment CTA gradient card — зөвхөн элсээгүй үед */}
      {!isEnrolled && (
        <div className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-primary to-[#7a59ff] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">{tLesson('enrollCta')}</h3>
            <p className="opacity-90">{tLesson('enrollCtaDesc')}</p>
          </div>
          <div className="relative z-10 shrink-0">
            <button
              onClick={() => enrollMutation.mutate(courseId)}
              disabled={enrollMutation.isPending}
              className="px-8 py-3 bg-white text-primary font-bold rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-70 flex items-center gap-2"
            >
              {enrollMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {tLesson('enrollCtaButton')}
            </button>
          </div>
          {/* Декор хэлбэрүүд */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute right-20 -top-10 w-20 h-20 bg-white/5 rounded-full" />
        </div>
      )}
    </div>
  );
}
