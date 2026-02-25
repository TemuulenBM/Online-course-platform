'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCourseLessons } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TextContentEditor } from '@/components/teacher/text-content-editor';
import { VideoContentEditor } from '@/components/teacher/video-content-editor';
import { ROUTES } from '@/lib/constants';

interface ContentPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

/** Багшийн контент засах хуудас — text/video тусдаа editor */
export default function TeacherContentPage({ params }: ContentPageProps) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();
  const tCommon = useTranslations('common');

  const { data: lessons, isLoading } = useCourseLessons(courseId);
  const currentLesson = lessons?.find((l) => l.id === lessonId);

  const handleBack = () => {
    router.push(ROUTES.TEACHER_CURRICULUM(courseId));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[960px] mx-auto space-y-6">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        {tCommon('error')}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">
        {currentLesson.lessonType === 'video' ? (
          <VideoContentEditor lessonId={lessonId} onBack={handleBack} />
        ) : (
          <TextContentEditor lessonId={lessonId} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
