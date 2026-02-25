'use client';

import { Loader2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Lesson } from '@ocp/shared-types';
import type { CourseProgress } from '@/lib/api-services/progress.service';
import type { LessonContent } from '@/lib/api-services/content.service';
import { LessonSidebarItem } from './lesson-sidebar-item';
import { LessonAttachments, type ContentAttachment } from './lesson-attachments';
import { CourseProgressWidget } from './course-progress-widget';

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  slug: string;
  courseProgress?: CourseProgress | null;
  isEnrolled: boolean;
  onEnroll?: () => void;
  enrollPending?: boolean;
  contentType?: string;
  content?: LessonContent | null;
}

/** Course sidebar — text/video тусдаа variant */
export function LessonSidebar({
  lessons,
  currentLessonId,
  slug,
  courseProgress,
  isEnrolled,
  onEnroll,
  enrollPending,
  contentType,
  content,
}: LessonSidebarProps) {
  const t = useTranslations('lessonViewer');
  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);

  /** Хичээлийн ахиц олох */
  const getProgress = (lessonId: string) =>
    courseProgress?.lessons?.find((l) => l.lessonId === lessonId);

  /** Video sidebar — attachments + course progress widget */
  if (contentType === 'video') {
    const attachments = ((content?.metadata as Record<string, unknown>)?.attachments ||
      []) as ContentAttachment[];

    return (
      <div className="space-y-6">
        {attachments.length > 0 && <LessonAttachments attachments={attachments} />}
        {courseProgress && <CourseProgressWidget courseProgress={courseProgress} />}
      </div>
    );
  }

  /** Text sidebar — section outline + enrollment CTA */
  return (
    <div className="sticky top-24 space-y-6">
      {/* Хичээлийн агуулга (section outline) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-lg mb-4">{t('sectionContent')}</h3>
        <div className="space-y-3">
          {sorted.map((lesson) => (
            <LessonSidebarItem
              key={lesson.id}
              lesson={lesson}
              slug={slug}
              isActive={lesson.id === currentLessonId}
              progress={getProgress(lesson.id)}
              isEnrolled={isEnrolled}
            />
          ))}
        </div>
      </div>

      {/* Enrollment CTA card — элсээгүй үед */}
      {!isEnrolled && (
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl text-center">
          <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
            <ShieldCheck className="size-6" />
          </div>
          <h3 className="font-bold mb-2">{t('enrollmentRequiredSidebar')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {t('enrollmentRequiredSidebarDesc')}
          </p>
          <button
            onClick={onEnroll}
            disabled={enrollPending}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {enrollPending && <Loader2 className="size-4 animate-spin" />}
            {t('registerBtn')}
          </button>
        </div>
      )}
    </div>
  );
}
