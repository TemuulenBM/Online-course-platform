'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  Lock,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LessonContent } from '@/lib/api-services/content.service';
import { getFileUrl } from '@/lib/utils';

interface LessonVideoPlayerProps {
  content: LessonContent;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  enrollPending?: boolean;
  /** Хичээлийн ID — progress tracking-д ашиглагдана */
  lessonId?: string;
  /** Сүүлийн хадгалсан байрлал — resume playback */
  lastPositionSeconds?: number;
  /** Видеоны байрлал шинэчлэх callback */
  onPositionUpdate?: (position: number) => void;
}

/** Цагийг MM:SS форматаар буцаах */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Видео тоглуулагч — custom HTML5 controls + enrollment overlay + progress tracking */
export function LessonVideoPlayer({
  content,
  isEnrolled = true,
  onEnroll,
  enrollPending,
  lastPositionSeconds,
  onPositionUpdate,
}: LessonVideoPlayerProps) {
  const t = useTranslations('lessonViewer');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  /** Throttled position update-д ашиглагдана */
  const lastSavedPositionRef = useRef<number>(0);
  const hasResumedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);

  const videoUrl = getFileUrl(content.videoUrl);
  const thumbnailUrl = getFileUrl(content.thumbnailUrl);

  /** Controls-ийг харуулж тодорхой хугацааны дараа нуух */
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  /** Play/Pause toggle */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  /** Volume toggle — mute-ээс буцахад хуучин дууны түвшинг сэргээнэ */
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      video.volume = volume;
    } else {
      setVolume(video.volume);
      video.muted = true;
    }
    setIsMuted(video.muted);
  }, [volume]);

  /** Fullscreen toggle */
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  /** Progress bar дарах/чирэх */
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    },
    [duration],
  );

  const handleProgressMouseDown = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleProgressMouseUp = useCallback(() => {
    setIsSeeking(false);
  }, []);

  /** Video event listeners */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      setShowControls(true);
      /** Pause хийхэд байрлал хадгалах */
      if (onPositionUpdate && video.currentTime > 0) {
        onPositionUpdate(Math.floor(video.currentTime));
      }
    };
    const onTimeUpdate = () => {
      if (!isSeeking) setCurrentTime(video.currentTime);
      /** 10 секунд тутам байрлал хадгалах (throttled) */
      if (onPositionUpdate && Math.abs(video.currentTime - lastSavedPositionRef.current) >= 10) {
        lastSavedPositionRef.current = video.currentTime;
        onPositionUpdate(Math.floor(video.currentTime));
      }
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      /** Resume playback — өмнөх байрлалаас үргэлжлүүлэх */
      if (lastPositionSeconds && lastPositionSeconds > 0 && !hasResumedRef.current) {
        video.currentTime = lastPositionSeconds;
        hasResumedRef.current = true;
      }
    };
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [isSeeking, onPositionUpdate, lastPositionSeconds]);

  /** Cleanup timeout */
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative group aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-primary/5"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video элемент */}
      {videoUrl && isEnrolled ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={videoUrl}
          poster={thumbnailUrl}
          onClick={togglePlay}
          playsInline
        />
      ) : (
        <>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
          )}
        </>
      )}

      {/* Enrollment overlay — элсээгүй үед */}
      {!isEnrolled && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10">
          <Lock className="size-16 text-primary mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">{t('enrollToAccess')}</h3>
          <p className="text-slate-300 mb-6 max-w-sm">{t('enrollToAccessDesc')}</p>
          <button
            onClick={onEnroll}
            disabled={enrollPending}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-70"
          >
            <span>{t('enrollNowBtn')}</span>
            <ArrowRight className="size-5" />
          </button>
        </div>
      )}

      {/* Center play button — зөвхөн pause/initial үед */}
      {isEnrolled && videoUrl && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-[5]">
          <button
            onClick={togglePlay}
            className="size-20 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg transform transition hover:scale-110 active:scale-95"
          >
            <Play className="size-10 fill-white ml-1" />
          </button>
        </div>
      )}

      {/* Video байхгүй бол play icon */}
      {isEnrolled && !videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-20 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-lg">
            <Play className="size-10 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Custom controls bar — зөвхөн enrolled + video байхад */}
      {isEnrolled && videoUrl && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress bar */}
          <div
            className="group/progress relative h-1.5 w-full bg-white/20 rounded-full mb-4 cursor-pointer"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
          >
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 size-4 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform"
              style={{ left: `${progressPercent}%`, marginLeft: '-8px' }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Зүүн controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-primary transition-colors"
              >
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              </button>
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary transition-colors"
              >
                {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Баруун controls */}
            <div className="flex items-center gap-3">
              <button className="text-white text-xs font-bold px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors uppercase">
                1080p
              </button>
              <button className="text-white hover:text-primary transition-colors">
                <Subtitles className="size-5" />
              </button>
              <button className="text-white hover:text-primary transition-colors">
                <Settings className="size-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-primary transition-colors"
              >
                {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
