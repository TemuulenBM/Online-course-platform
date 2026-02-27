'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCompleteLesson } from '@/hooks/api';

interface LessonCompleteButtonProps {
  lessonId: string;
  isCompleted: boolean;
  /** Видео хичээлд progress card харуулах */
  progressPercentage?: number;
  variant?: 'text' | 'video';
}

/** Хичээл дуусгах товч — text болон video хичээлд ашиглагдана */
export function LessonCompleteButton({
  lessonId,
  isCompleted,
  progressPercentage,
  variant = 'text',
}: LessonCompleteButtonProps) {
  const t = useTranslations('progress');
  const completeMutation = useCompleteLesson();

  const handleComplete = () => {
    completeMutation.mutate(lessonId, {
      onSuccess: () => {
        toast.success(t('lessonCompletedSuccess'));
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Error');
      },
    });
  };

  /** Дууссан бол success card */
  if (isCompleted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="size-6 text-emerald-500 shrink-0" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {t('lessonCompletedSuccess')}
        </span>
      </div>
    );
  }

  /** Video variant: progress card + button */
  if (variant === 'video' && progressPercentage !== undefined) {
    return (
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl font-bold text-primary">{progressPercentage}%</span>
          <span className="text-xs text-slate-500 font-medium">{t('videoProgress')}</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {progressPercentage >= 80 && (
          <p className="text-xs text-primary font-medium mb-3">{t('almostDone')}</p>
        )}
        <button
          type="button"
          onClick={handleComplete}
          disabled={completeMutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {completeMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t('completing')}
            </>
          ) : (
            <>
              <CheckCircle className="size-4" />
              {t('completeLesson')}
            </>
          )}
        </button>
      </div>
    );
  }

  /** Text variant: simple button */
  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={completeMutation.isPending}
      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
    >
      {completeMutation.isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {t('completing')}
        </>
      ) : (
        <>
          <CheckCircle className="size-4" />
          {t('completeLesson')}
        </>
      )}
    </button>
  );
}
