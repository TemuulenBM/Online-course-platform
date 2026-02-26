'use client';

import { Loader2, ShieldCheck, PlaySquare, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Lesson } from '@ocp/shared-types';
import type { CourseProgress } from '@/lib/api-services/progress.service';
import type { LessonContent } from '@/lib/api-services/content.service';
import { LessonSidebarItem } from './lesson-sidebar-item';
import { LessonAttachments, type ContentAttachment } from './lesson-attachments';

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
  /** Сургалтын нэр — video sidebar-д харуулах */
  courseTitle?: string;
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
  courseTitle,
}: LessonSidebarProps) {
  const t = useTranslations('lessonViewer');
  const tp = useTranslations('progress');
  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);

  /** Хичээлийн ахиц олох */
  const getProgress = (lessonId: string) =>
    courseProgress?.lessons?.find((l) => l.lessonId === lessonId);

  /** Нийт хугацаа тооцоолох */
  const totalDuration = sorted.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;
  const durationText =
    totalHours > 0
      ? `${totalHours} ${tp('hours')} ${totalMins} ${tp('minutes')}`
      : `${totalMins} ${tp('minutes')}`;

  const attachments = ((content?.metadata as Record<string, unknown>)?.attachments ||
    []) as ContentAttachment[];

  /** Video sidebar — course info card + lesson list + attachments */
  if (contentType === 'video') {
    const progressPercent = courseProgress?.courseProgressPercentage ?? 0;

    return (
      <div className="sticky top-24 space-y-4">
        {/* Course info card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <PlaySquare className="size-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {courseTitle || t('sectionContent')}
              </h3>
              <p className="text-xs text-slate-500">
                {sorted.length} {t('lessonLabel')} • {durationText}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          {isEnrolled && courseProgress && (
            <div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1.5 font-medium">
                {tp('progressCol')}: {progressPercent}%
              </p>
            </div>
          )}
        </div>

        {/* Lesson list */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 p-3 max-h-[400px] overflow-y-auto">
          <div className="space-y-1">
            {sorted.map((lesson) => (
              <LessonSidebarItem
                key={lesson.id}
                lesson={lesson}
                slug={slug}
                isActive={lesson.id === currentLessonId}
                progress={getProgress(lesson.id)}
                isEnrolled={isEnrolled}
                variant="video"
              />
            ))}
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && <LessonAttachments attachments={attachments} />}

        {/* Материал татах placeholder */}
        {isEnrolled && attachments.length === 0 && (
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Download className="size-4" />
            {tp('downloadMaterials')}
          </button>
        )}
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
              variant="text"
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
