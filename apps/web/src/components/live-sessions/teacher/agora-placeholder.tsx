'use client';

import { VideoOff } from 'lucide-react';
import { AgoraTeacherRoom } from './agora-teacher-room';

interface AgoraPlaceholderProps {
  /** Session явагдаж байгаа эсэх */
  isLive?: boolean;
  /** Өнгөрсөн хугацаа форматтай (00:00:00) */
  elapsed?: string;
  /** Микрофон хаасан эсэх */
  isMuted?: boolean;
  /** Камер хаасан эсэх */
  isCameraOff?: boolean;
  /** Screen share хийж буй эсэх */
  isScreenSharing?: boolean;
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  onScreenShare?: () => void;
  onEnd?: () => void;

  /** Agora холболтын параметрүүд — isLive=true үед шаардлагатай */
  appId?: string;
  channelName?: string;
  token?: string;
  uid?: number;
  onTokenWillExpire?: () => void;
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * Багшийн видео талбай.
 * - LIVE + Agora params бэлэн → AgoraTeacherRoom (бодит streaming)
 * - LIVE + params дутуу → холбогдож буй state
 * - SCHEDULED → "Start" хүлээж буй placeholder
 */
export function AgoraPlaceholder({
  isLive,
  elapsed = '00:00:00',
  isMuted,
  isCameraOff: cameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onScreenShare,
  onEnd,
  appId,
  channelName,
  token,
  uid,
  onTokenWillExpire,
  onConnectionChange,
}: AgoraPlaceholderProps) {
  /** Agora-д шаардлагатай бүх параметр бэлэн */
  const canConnect = isLive && !!(appId && channelName && token && uid != null);

  if (canConnect) {
    return (
      <AgoraTeacherRoom
        appId={appId!}
        channelName={channelName!}
        token={token!}
        uid={uid!}
        isMuted={!!isMuted}
        isCameraOff={!!cameraOff}
        isScreenSharing={!!isScreenSharing}
        elapsed={elapsed}
        onToggleMute={onToggleMute}
        onToggleCamera={onToggleCamera}
        onScreenShare={onScreenShare}
        onEnd={onEnd}
        onTokenWillExpire={onTokenWillExpire}
        onConnectionChange={onConnectionChange}
      />
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border-4 border-white bg-slate-900 shadow-2xl">
      {/* Placeholder content */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-slate-900">
        <div className="text-center">
          <VideoOff className="mx-auto mb-4 size-16 text-white/50" />
          {isLive ? (
            <>
              <p className="font-medium text-white">Холбогдож байна...</p>
              <p className="text-sm text-white/60">Agora session эхлэж байна</p>
            </>
          ) : (
            <>
              <p className="font-medium text-white">Хичээл эхлүүлэх боломжтой</p>
              <p className="text-sm text-white/60">Start товчийг дарж хичээлийг эхлүүлнэ үү</p>
            </>
          )}
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
    </div>
  );
}
