'use client';

import { Radio } from 'lucide-react';
import { SelfViewMini } from './self-view-mini';
import { VideoControls } from './video-controls';

interface VideoContainerProps {
  isConnecting?: boolean;
  isConnected?: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  userName?: string;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

/**
 * Үндсэн видео талбай — connecting animation, self-view, LIVE badge, controls.
 */
export function VideoContainer({
  isConnecting,
  isConnected,
  isMuted,
  isCameraOff,
  isScreenSharing,
  userName,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
}: VideoContainerProps) {
  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 shadow-2xl">
      {/* Агуулга — холбогдож буй эсвэл stream placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        {isConnecting ? (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <Radio className="relative size-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white">Холбогдож байна...</h3>
            <p className="max-w-xs text-sm text-slate-400">
              Түр хүлээнэ үү. Шууд дамжуулалт эхэлж байна.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <Radio className="mx-auto mb-3 size-12 text-white/30" />
            <p className="text-sm text-white/50">Агора видео stream энд харагдана</p>
          </div>
        )}
      </div>

      {/* Self-view */}
      <SelfViewMini isCameraOff={isCameraOff} userName={userName} />

      {/* LIVE badge */}
      {isConnected && (
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white animate-pulse">
          <span className="size-2 rounded-full bg-white" />
          LIVE
        </div>
      )}

      {/* Controls — доод дундад хэсэг */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <VideoControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={onToggleMute}
          onToggleCamera={onToggleCamera}
          onToggleScreenShare={onToggleScreenShare}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  );
}
