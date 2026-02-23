'use client';

import { Play } from 'lucide-react';
import type { LessonContent } from '@/lib/api-services/content.service';

interface LessonVideoPlayerProps {
  content: LessonContent;
}

/** Видео тоглуулагч — HTML5 video + thumbnail overlay */
export function LessonVideoPlayer({ content }: LessonVideoPlayerProps) {
  if (content.videoUrl) {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900">
        <video
          className="w-full h-full object-cover"
          src={content.videoUrl}
          poster={content.thumbnailUrl}
          controls
          controlsList="nodownload"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
      {content.thumbnailUrl && (
        <img
          src={content.thumbnailUrl}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}
      <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Play className="size-8 text-white fill-white ml-1" />
      </div>
    </div>
  );
}
