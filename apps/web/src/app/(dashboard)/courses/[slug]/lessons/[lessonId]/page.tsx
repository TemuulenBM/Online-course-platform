'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, Loader2 } from 'lucide-react';
import {
  useCourseBySlug,
  useCourseLessons,
  useLessonContent,
  useCourseProgress,
  useCompleteLesson,
} from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import {
  LessonVideoPlayer,
  LessonTextContent,
  LessonHeader,
  LessonNavigation,
  LessonComments,
  LessonSidebar,
  LessonViewerSkeleton,
} from '@/components/lesson-viewer';

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

  const completeMutation = useCompleteLesson();

  /** Одоогийн хичээлийг олох */
  const currentLesson = lessons?.find((l) => l.id === lessonId);

  /** Хичээлийн ахиц */
  const lessonProgressData = courseProgress?.lessons?.find((l) => l.lessonId === lessonId);
  const isCompleted = lessonProgressData?.completed ?? false;

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

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-6 lg:p-8">
      {/* Зүүн тал — контент */}
      <div className="flex-1 flex flex-col gap-6 max-w-[800px]">
        {/* Видео эсвэл текст контент */}
        {content?.contentType === 'video' ? (
          <LessonVideoPlayer content={content} />
        ) : content?.textContent ? (
          <LessonTextContent textContent={content.textContent} />
        ) : (
          <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <p className="text-slate-500">{tCommon('noData')}</p>
          </div>
        )}

        {/* Гарчиг */}
        <LessonHeader lesson={currentLesson} />

        {/* Previous / Next */}
        {lessons && <LessonNavigation lessons={lessons} currentLessonId={lessonId} slug={slug} />}

        {/* Mark as Complete товч */}
        {isAuthenticated && (
          <div>
            {isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="size-5" />
                <span className="text-sm font-medium">{t('lessonCompleted')}</span>
              </div>
            ) : (
              <button
                onClick={() => completeMutation.mutate(lessonId)}
                disabled={completeMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {completeMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle className="size-4" />
                )}
                {t('markComplete')}
              </button>
            )}
          </div>
        )}

        {/* Separator */}
        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Сэтгэгдлүүд */}
        <LessonComments lessonId={lessonId} />
      </div>

      {/* Баруун sidebar */}
      <aside className="w-full xl:w-[380px] shrink-0">
        {lessons && (
          <LessonSidebar
            lessons={lessons}
            currentLessonId={lessonId}
            slug={slug}
            courseProgress={courseProgress}
          />
        )}
      </aside>
    </div>
  );
}
