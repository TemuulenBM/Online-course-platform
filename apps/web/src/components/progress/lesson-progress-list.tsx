'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronUp, Lock, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LessonProgressSummary } from '@/lib/api-services/progress.service';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/lib/constants';

interface LessonProgressListProps {
  lessons: LessonProgressSummary[];
  courseSlug: string;
}

const INITIAL_COUNT = 5;

/** Сургалтын хичээлүүдийн ахицын жагсаалт */
export function LessonProgressList({ lessons, courseSlug }: LessonProgressListProps) {
  const t = useTranslations('progress');
  const [showAll, setShowAll] = useState(false);

  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_COUNT);

  /** Хичээлийн одоогийн статус тодорхойлох */
  const getStatus = (lesson: LessonProgressSummary, index: number) => {
    if (lesson.completed) return 'completed';
    if (lesson.progressPercentage > 0) return 'in-progress';
    /** Өмнөх бүх хичээл дууссан бол unlock, эсвэл lock */
    const allPrevCompleted = sorted.slice(0, index).every((l) => l.completed);
    return allPrevCompleted ? 'unlocked' : 'locked';
  };

  /** Хугацааг "34:12 / 52:00" формат руу хөрвүүлэх */
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /** Lesson type-ийн badge өнгө */
  const typeBadgeColor: Record<string, string> = {
    VIDEO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TEXT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    QUIZ: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    ASSIGNMENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    LIVE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 p-6">
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-6">
        {t('lessonPlan')}
      </h2>

      <div className="space-y-3">
        {visible.map((lesson, index) => {
          const status = getStatus(lesson, index);
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const isActive = status === 'in-progress';
          const typeKey = lesson.lessonType?.toUpperCase() || 'TEXT';

          return (
            <div
              key={lesson.lessonId}
              className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                isActive
                  ? 'border-primary/30 bg-primary/5 ring-2 ring-primary/20'
                  : isCompleted
                    ? 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10'
                    : isLocked
                      ? 'border-slate-200 dark:border-slate-700 opacity-60'
                      : 'border-primary/10 hover:border-primary/20 hover:bg-primary/5'
              }`}
            >
              {/* Status icon */}
              <div
                className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-primary text-white'
                      : isLocked
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        : 'bg-primary/10 text-primary'
                }`}
              >
                {isCompleted ? (
                  <Check className="size-5" />
                ) : isLocked ? (
                  <Lock className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isLocked ? (
                    <span className="text-sm font-medium text-slate-400 dark:text-slate-500 line-clamp-1">
                      {lesson.lessonTitle}
                    </span>
                  ) : (
                    <Link
                      href={ROUTES.LESSON_VIEWER(courseSlug, lesson.lessonId)}
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-primary transition-colors line-clamp-1"
                    >
                      {lesson.lessonTitle}
                    </Link>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold border-0 ${typeBadgeColor[typeKey] || typeBadgeColor.TEXT}`}
                  >
                    {t(typeKey.toLowerCase() as 'video' | 'text' | 'quiz' | 'assignment' | 'live')}
                  </Badge>
                </div>

                {/* Progress bar */}
                {!isLocked && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <Progress
                      value={lesson.progressPercentage}
                      className={`h-1.5 flex-1 max-w-xs ${isCompleted ? '[&>div]:bg-emerald-500' : ''}`}
                    />
                    {isActive && lesson.lastPositionSeconds > 0 && (
                      <span className="text-xs text-slate-500 font-mono">
                        {formatDuration(lesson.lastPositionSeconds)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right status */}
              <div className="shrink-0">
                {isCompleted && (
                  <span className="text-xs font-semibold text-emerald-600">
                    {t('lessonCompleted')}
                  </span>
                )}
                {isActive && (
                  <span className="text-xs font-semibold text-primary">{t('nowWatching')}</span>
                )}
                {isLocked && (
                  <span className="text-xs font-medium text-slate-400">{t('locked')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more / Show less */}
      {sorted.length > INITIAL_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 py-2 transition-colors"
        >
          {showAll ? (
            <>
              {t('hideAll')}
              <ChevronUp className="size-4" />
            </>
          ) : (
            <>
              {t('viewAll')}
              <ChevronDown className="size-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
