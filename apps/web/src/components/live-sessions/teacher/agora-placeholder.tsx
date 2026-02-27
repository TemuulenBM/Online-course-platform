'use client';

import { VideoOff, Mic, MicOff, Video, MonitorUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgoraPlaceholderProps {
  /** Session явагдаж байгаа эсэх */
  isLive?: boolean;
  /** Өнгөрсөн хугацаа форматтай */
  elapsed?: string;
  /** Микрофон хаасан эсэх */
  isMuted?: boolean;
  /** Камер хаасан эсэх */
  isCameraOff?: boolean;
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  onScreenShare?: () => void;
  onEnd?: () => void;
}

/**
 * Agora Live Stream Placeholder — багшийн видео талбай.
 * Controls + LIVE badge + timer.
 */
export function AgoraPlaceholder({
  isLive,
  elapsed = '00:00:00',
  isMuted,
  isCameraOff: cameraOff,
  onToggleMute,
  onToggleCamera,
  onScreenShare,
  onEnd,
}: AgoraPlaceholderProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border-4 border-white bg-slate-900 shadow-2xl">
      {/* Placeholder content */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-slate-900">
        <div className="text-center">
          <VideoOff className="mx-auto mb-4 size-16 text-white/50" />
          <p className="font-medium text-white">Agora Live Stream Placeholder</p>
          <p className="text-sm text-white/60">Хичээл эхлүүлэх товчийг дарж холбогдоно уу</p>
        </div>
      </div>

      {/* LIVE badge + Timer */}
      <div className="absolute right-4 top-4 flex gap-2">
        {isLive && (
          <span className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
        )}
        <span className="rounded bg-black/50 px-2 py-1 text-[10px] font-bold tabular-nums text-white backdrop-blur-md">
          {elapsed}
        </span>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex gap-4">
          <button
            onClick={onToggleMute}
            className={cn(
              'flex size-10 items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors',
              isMuted ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/20 hover:bg-white/40',
            )}
          >
            {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>
          <button
            onClick={onToggleCamera}
            className={cn(
              'flex size-10 items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors',
              cameraOff ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/20 hover:bg-white/40',
            )}
          >
            {cameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
          </button>
          <button
            onClick={onScreenShare}
            className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
          >
            <MonitorUp className="size-5" />
          </button>
        </div>
        <button
          onClick={onEnd}
          className="rounded-lg bg-red-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
        >
          Дуусгах
        </button>
      </div>
    </div>
  );
}
