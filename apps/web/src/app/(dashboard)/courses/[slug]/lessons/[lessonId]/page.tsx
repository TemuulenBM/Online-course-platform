'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bookmark, Share2, ChevronRight } from 'lucide-react';
import {
  useCourseBySlug,
  useCourseLessons,
  useLessonContent,
  useCourseProgress,
  useCompleteLesson,
  useCheckEnrollment,
  useEnroll,
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
  const [activeTab, setActiveTab] = useState<'description' | 'downloads' | 'discussion'>(
    'description',
  );

  /** Data fetching */
  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(course?.id ?? '');
  const { data: content, isLoading: contentLoading } = useLessonContent(lessonId);
  const { data: courseProgress } = useCourseProgress(isAuthenticated ? (course?.id ?? '') : '');
  const { data: enrollmentCheck } = useCheckEnrollment(isAuthenticated ? (course?.id ?? '') : '');

  const completeMutation = useCompleteLesson();
  const enrollMutation = useEnroll();

  const isEnrolled = enrollmentCheck?.isEnrolled ?? false;

  /** Одоогийн хичээлийг олох */
  const currentLesson = lessons?.find((l) => l.id === lessonId);

  /** Хичээлийн ахиц */
  const lessonProgressData = courseProgress?.lessons?.find((l) => l.lessonId === lessonId);
  const isCompleted = lessonProgressData?.completed ?? false;

  /** Preview бол enrollment шаардлагагүй */
  const hasAccess = isEnrolled || (currentLesson?.isPreview ?? false);

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

  /** Content tabs */
  const tabs = [
    { key: 'description' as const, label: t('descriptionTab') },
    { key: 'downloads' as const, label: t('downloadsTab') },
    { key: 'discussion' as const, label: t('discussionTab') },
  ];

  return (
    <main className="flex-1 flex flex-col overflow-y-auto">
      {/* Header / Breadcrumb */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
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
        <div className="flex gap-2">
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bookmark className="size-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Share2 className="size-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </header>

      {/* Video/Player Area */}
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Видео эсвэл текст контент */}
        {content?.contentType === 'video' ? (
          <LessonVideoPlayer
            content={content}
            isEnrolled={hasAccess}
            onEnroll={handleEnroll}
            enrollPending={enrollMutation.isPending}
          />
        ) : content?.textContent ? (
          hasAccess ? (
            <LessonTextContent textContent={content.textContent} />
          ) : (
            <LessonVideoPlayer
              content={content}
              isEnrolled={false}
              onEnroll={handleEnroll}
              enrollPending={enrollMutation.isPending}
            />
          )
        ) : (
          <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <p className="text-slate-500">{tCommon('noData')}</p>
          </div>
        )}

        {/* Lesson Info & Metadata + Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <LessonHeader
            lesson={currentLesson}
            isCompleted={isCompleted}
            isAuthenticated={isAuthenticated}
            onComplete={() => completeMutation.mutate(lessonId)}
            completePending={completeMutation.isPending}
          />
          <div className="shrink-0">
            {lessons && (
              <LessonNavigation lessons={lessons} currentLessonId={lessonId} slug={slug} />
            )}
          </div>
        </div>

        {/* Content Tabs + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Зүүн тал — tabs + контент */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab контент */}
            {activeTab === 'description' && (
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                {content?.textContent && hasAccess ? (
                  <div dangerouslySetInnerHTML={{ __html: content.textContent }} />
                ) : (
                  <p className="text-slate-500">{tCommon('noData')}</p>
                )}
              </div>
            )}

            {activeTab === 'discussion' && <LessonComments lessonId={lessonId} />}

            {activeTab === 'downloads' && (
              <div className="py-8 text-center text-slate-500">{tCommon('noData')}</div>
            )}
          </div>

          {/* Баруун sidebar */}
          <div>
            {lessons && (
              <LessonSidebar
                lessons={lessons}
                currentLessonId={lessonId}
                slug={slug}
                courseProgress={courseProgress}
                isEnrolled={isEnrolled}
                onEnroll={handleEnroll}
                enrollPending={enrollMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto p-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Learnify Education Platform.
        </p>
      </footer>
    </main>
  );
}
