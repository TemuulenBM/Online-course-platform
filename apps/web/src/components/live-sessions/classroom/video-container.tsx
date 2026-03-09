'use client';

import { Radio } from 'lucide-react';
import { AgoraRoom } from './agora-room';
import { VideoControls } from './video-controls';

interface VideoContainerProps {
  /** Agora холболтын параметрүүд */
  appId?: string;
  channelName?: string;
  token?: string;
  uid?: number;
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
  /** Холболтын state өөрчлөгдөх callback */
  onConnectionChange?: (connected: boolean) => void;
  /** Token expire callback */
  onTokenWillExpire?: () => void;
}

/**
 * Үндсэн видео талбай — Agora SDK бодит холболт хийгдсэн бол AgoraRoom,
 * параметр дутуу бол connecting animation харуулна.
 */
export function VideoContainer({
  appId,
  channelName,
  token,
  uid,
  isConnecting,
  isMuted,
  isCameraOff,
  isScreenSharing,
  userName,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
  onConnectionChange,
  onTokenWillExpire,
}: VideoContainerProps) {
  /** Agora-д шаардлагатай бүх параметр бэлэн эсэх */
  const canConnect = !!(appId && channelName && token && uid != null);

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 shadow-2xl">
      {/* Бодит Agora видео */}
      {canConnect ? (
        <AgoraRoom
          appId={appId!}
          channelName={channelName!}
          token={token!}
          uid={uid!}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          userName={userName}
          onConnectionChange={onConnectionChange}
          onTokenWillExpire={onTokenWillExpire}
        />
      ) : (
        /* Параметр дутуу — connecting state */
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
              <p className="text-sm text-white/50">Агора видео stream эхлэхэд бэлэн болно</p>
            </div>
          )}
        </div>
      )}

      {/* Controls — доод дундад хэсэг */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
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
