'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import {
  useCourseBySlug,
  useCourseLessons,
  useLessonContent,
  useCourseProgress,
  useCheckEnrollment,
  useEnroll,
  useUpdateVideoPosition,
} from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import {
  LessonVideoPlayer,
  LessonTextContent,
  LessonHeader,
  LessonNavigation,
  LessonSidebar,
  LessonViewerSkeleton,
  LessonProgressBar,
  LessonVideoMeta,
  MobileBottomNav,
  LessonCompleteButton,
} from '@/components/lesson-viewer';
import { QuizInfoPanel } from '@/components/quiz/QuizInfoPanel';

export default function LessonViewerPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = use(params);
  const t = useTranslations('lessonViewer');
  const tCommon = useTranslations('common');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  /** Data fetching */
  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(course?.id ?? '');
  const { data: content, isLoading: contentLoading } = useLessonContent(lessonId);
  const { data: courseProgress } = useCourseProgress(isAuthenticated ? (course?.id ?? '') : '');
  const { data: enrollmentCheck } = useCheckEnrollment(isAuthenticated ? (course?.id ?? '') : '');

  const enrollMutation = useEnroll();
  const videoPositionMutation = useUpdateVideoPosition();

  const isEnrolled = enrollmentCheck?.isEnrolled ?? false;

  /** Одоогийн хичээлийг олох */
  const currentLesson = lessons?.find((l) => l.id === lessonId);

  /** Хичээлийн ахиц */
  const lessonProgressData = courseProgress?.lessons?.find((l) => l.lessonId === lessonId);

  /** Preview бол enrollment шаардлагагүй */
  const hasAccess = isEnrolled || (currentLesson?.isPreview ?? false);

  /** Контентийн төрөл */
  const contentType = content?.contentType || currentLesson?.lessonType || 'text';

  /** Reading time metadata-аас */
  const readingTimeMinutes = (content?.metadata as Record<string, unknown>)?.readingTimeMinutes as
    | number
    | undefined;

  /** Loading state */
  if (courseLoading || lessonsLoading || contentLoading) {
    return <LessonViewerSkeleton />;
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500">
        {tCommon('error')}
      </div>
    );
  }

  const handleEnroll = () => {
    if (course?.id) enrollMutation.mutate(course.id);
  };

  /** Видеоны байрлал шинэчлэх — throttled callback */
  const handleVideoPositionUpdate = useCallback(
    (position: number) => {
      if (isEnrolled && lessonId) {
        videoPositionMutation.mutate({ lessonId, lastPositionSeconds: position });
      }
    },
    [isEnrolled, lessonId, videoPositionMutation],
  );

  return (
    <main className="flex-1 flex flex-col overflow-y-auto">
      {/* Breadcrumb */}
      <nav className="px-4 py-8 lg:px-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 text-sm">
          <a
            href={`/courses/${slug}`}
            className="text-slate-500 hover:text-primary transition-colors"
          >
            {course.title}
          </a>
          <ChevronRight className="size-4 text-slate-300 dark:text-slate-600" />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {t('lesson')} {currentLesson.orderIndex}: {currentLesson.title}
          </span>
        </div>
      </nav>

      {/* Контент — QUIZ / Video / Text тусдаа layout */}
      {currentLesson.lessonType === 'quiz' ? (
        /* ───────── QUIZ LAYOUT ───────── */
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-10 pb-10">
          <QuizInfoPanel lessonId={lessonId} />
        </div>
      ) : contentType === 'video' ? (
        /* ───────── VIDEO LAYOUT ───────── */
        <div className="max-w-[1200px] mx-auto w-full px-4 lg:px-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Зүүн тал — video + meta + navigation */}
            <div className="lg:col-span-2 space-y-6">
              <LessonHeader
                lesson={currentLesson}
                contentType="video"
                moduleNumber={currentLesson.orderIndex}
              />
              <LessonVideoPlayer
                content={content!}
                isEnrolled={hasAccess}
                onEnroll={handleEnroll}
                enrollPending={enrollMutation.isPending}
                lessonId={lessonId}
                lastPositionSeconds={lessonProgressData?.lastPositionSeconds}
                onPositionUpdate={handleVideoPositionUpdate}
              />
              <LessonVideoMeta
                description={
                  (content?.metadata as Record<string, unknown>)?.description as string | undefined
                }
              />
              {/* Хичээл дуусгах товч */}
              {isEnrolled && (
                <LessonCompleteButton
                  lessonId={lessonId}
                  isCompleted={lessonProgressData?.completed ?? false}
                  progressPercentage={lessonProgressData?.progressPercentage ?? 0}
                  variant="video"
                />
              )}
              {lessons && (
                <LessonNavigation lessons={lessons} currentLessonId={lessonId} slug={slug} />
              )}
            </div>

            {/* Баруун sidebar — attachments + course progress */}
            <aside>
              <LessonSidebar
                lessons={lessons ?? []}
                currentLessonId={lessonId}
                slug={slug}
                courseProgress={courseProgress}
                isEnrolled={isEnrolled}
                onEnroll={handleEnroll}
                enrollPending={enrollMutation.isPending}
                contentType="video"
                content={content}
                courseTitle={course.title}
              />
            </aside>
          </div>
        </div>
      ) : (
        /* ───────── TEXT LAYOUT ───────── */
        <div className="max-w-5xl mx-auto w-full px-4 lg:px-10 pb-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Үндсэн контент */}
            <div className="flex-1 space-y-6">
              <LessonHeader
                lesson={currentLesson}
                contentType="text"
                readingTimeMinutes={readingTimeMinutes}
              />
              <LessonProgressBar progressPercentage={lessonProgressData?.progressPercentage ?? 0} />
              {content?.textContent && hasAccess ? (
                <LessonTextContent textContent={content.textContent} />
              ) : (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-center text-slate-500">
                  {tCommon('noData')}
                </div>
              )}
              {/* Хичээл дуусгах товч */}
              {isEnrolled && (
                <LessonCompleteButton
                  lessonId={lessonId}
                  isCompleted={lessonProgressData?.completed ?? false}
                  variant="text"
                />
              )}
              {lessons && (
                <LessonNavigation lessons={lessons} currentLessonId={lessonId} slug={slug} />
              )}
            </div>

            {/* Баруун sidebar — section outline + enrollment CTA */}
            <aside className="w-full lg:w-80 shrink-0">
              <LessonSidebar
                lessons={lessons ?? []}
                currentLessonId={lessonId}
                slug={slug}
                courseProgress={courseProgress}
                isEnrolled={isEnrolled}
                onEnroll={handleEnroll}
                enrollPending={enrollMutation.isPending}
                contentType="text"
                content={content}
              />
            </aside>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto px-4 lg:px-10 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} {t('footerCopyright')}
          </p>
          <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
              {t('footerPrivacy')}
            </span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
              {t('footerHelp')}
            </span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
              {t('footerContact')}
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </main>
  );
}
