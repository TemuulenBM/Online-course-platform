'use client';

import { Lock, ArrowRight, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LessonContent } from '@/lib/api-services/content.service';

interface LessonVideoPlayerProps {
  content: LessonContent;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  enrollPending?: boolean;
}

/** Видео тоглуулагч — enrollment overlay + HTML5 video */
export function LessonVideoPlayer({
  content,
  isEnrolled = true,
  onEnroll,
  enrollPending,
}: LessonVideoPlayerProps) {
  const t = useTranslations('lessonViewer');

  return (
    <div className="relative group aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
      {/* Background / Video */}
      {content.videoUrl && isEnrolled ? (
        <video
          className="w-full h-full object-cover"
          src={content.videoUrl}
          poster={content.thumbnailUrl}
          controls
          controlsList="nodownload"
        />
      ) : (
        <>
          {content.thumbnailUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: `url('${content.thumbnailUrl}')` }}
            />
          )}
          {!content.thumbnailUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
          )}
        </>
      )}

      {/* Restricted content overlay — элсээгүй үед */}
      {!isEnrolled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm p-6 text-center">
          <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Lock className="size-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('enrollRequired')}</h2>
          <p className="text-slate-400 max-w-md mb-8">{t('enrollRequiredDesc')}</p>
          <button
            onClick={onEnroll}
            disabled={enrollPending}
            className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-70"
          >
            <span>{t('enrollNow')}</span>
            <ArrowRight className="size-5" />
          </button>
        </div>
      )}

      {/* Video байхгүй бол play icon */}
      {isEnrolled && !content.videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="size-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}
