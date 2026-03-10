'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  LocalUser,
  LocalVideoTrack,
  RemoteUser,
  useClientEvent,
  useConnectionState,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useLocalScreenTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
} from 'agora-rtc-react';
import {
  AlertTriangle,
  Maximize,
  Mic,
  MicOff,
  Minimize,
  MonitorUp,
  RefreshCw,
  User,
  Video,
  VideoOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgoraTeacherRoomProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  elapsed?: string;
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  onScreenShare?: () => void;
  onEnd?: () => void;
  onTokenWillExpire?: () => void;
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * Багшийн Agora inner room компонент.
 * Өөрийн камерийг publish хийж, оролцогчдын оролцоог харна.
 */
function AgoraTeacherRoomInner({
  appId,
  channelName,
  token,
  uid,
  isMuted,
  isCameraOff,
  isScreenSharing,
  elapsed = '00:00:00',
  onToggleMute,
  onToggleCamera,
  onScreenShare,
  onEnd,
  onTokenWillExpire,
  onConnectionChange,
}: AgoraTeacherRoomProps) {
  const client = useRTCClient();

  /** Channel-д нэгдэх */
  useJoin({ appid: appId, channel: channelName, token, uid }, true);

  /** Локал медиа tracks — screen share үед camera track амьд байна, зүгээр publish хийхгүй */
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(!isMuted);
  const { localCameraTrack } = useLocalCameraTrack(!isCameraOff);
  const { screenTrack } = useLocalScreenTrack(isScreenSharing, {}, 'disable');

  /** Аудио track-г usePublish-ээр (олон audio зөвшөөрөгддөг) */
  usePublish([localMicrophoneTrack]);

  /** Remote оролцогчдын аудио */
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  audioTracks.forEach((track) => track.play());

  const connectionState = useConnectionState();

  /** Видео track-г гараар удирдах — camera ↔ screen share (Agora нэг видео track л зөвшөөрнө).
   *  usePublish нь unpublish/publish async дарааллыг баталгаажуулдаггүй тул
   *  await client.unpublish() → await client.publish() гэж дараалал хангана. */
  useEffect(() => {
    if (connectionState !== 'CONNECTED') return;

    let cancelled = false;

    const switchVideoTrack = async () => {
      try {
        if (isScreenSharing) {
          if (localCameraTrack) {
            try {
              await client.unpublish(localCameraTrack);
            } catch {
              /* аль хэдийн unpublish хийгдсэн */
            }
          }
          if (screenTrack && !cancelled) {
            await client.publish(screenTrack);
          }
        } else {
          if (screenTrack) {
            try {
              await client.unpublish(screenTrack);
            } catch {
              /* аль хэдийн unpublish хийгдсэн */
            }
          }
          if (localCameraTrack && !isCameraOff && !cancelled) {
            await client.publish(localCameraTrack);
          }
        }
      } catch {
        // Видео track солих алдаа — recoverable, нэмэлт арга хэмжээ шаардлагагүй
      }
    };

    switchVideoTrack();

    return () => {
      cancelled = true;
    };
  }, [isScreenSharing, screenTrack, localCameraTrack, connectionState, isCameraOff, client]);
  const [connectionTimedOut, setConnectionTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** CONNECTING state-д 15 сек-ээс илүү байвал timeout гэж тооцно */
  useEffect(() => {
    if (connectionState === 'CONNECTING' || connectionState === 'RECONNECTING') {
      timeoutRef.current = setTimeout(() => setConnectionTimedOut(true), 15_000);
    } else {
      setConnectionTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [connectionState]);

  useEffect(() => {
    const isConnected = connectionState === 'CONNECTED';
    onConnectionChange?.(isConnected);
  }, [connectionState, onConnectionChange]);

  useClientEvent(client, 'token-privilege-will-expire', () => {
    onTokenWillExpire?.();
  });

  /** PiP камер preview — screen share үед camera track-г жижиг div-д тоглуулна.
   *  Agora-д publish хийхгүй, зөвхөн локал preview.
   *  Cleanup-д stop() биш DOM element цэвэрлэнэ — track дахин ашиглах боломжтой. */
  const pipRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pipRef.current;
    if (!el) return;
    if (isScreenSharing && localCameraTrack && !isCameraOff) {
      localCameraTrack.play(el);
      return () => {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      };
    }
  }, [isScreenSharing, localCameraTrack, isCameraOff]);

  /** PiP drag — pointer events-ээр чирж зөөх боломж.
   *  CSS transform ашиглана, layout reflow-гүй. */
  const [pipPos, setPipPos] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );

  const onPipPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: pipPos.x,
        origY: pipPos.y,
      };
    },
    [pipPos],
  );

  const onPipPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPipPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  }, []);

  const onPipPointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  /** Fullscreen — native Fullscreen API ашиглана */
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      /** Fullscreen-ээс гарахад PiP байрлалыг reset — container жижирсэн тул хуучин координат тохирохгүй */
      if (!fs) setPipPos({ x: 0, y: 0 });
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const isLive = connectionState === 'CONNECTED';

  /** Холболт амжилтгүй болсон үед — timeout state */
  if (connectionTimedOut && connectionState !== 'CONNECTED') {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border-4 border-white bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-slate-900">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 size-16 text-red-400" />
            <p className="text-lg font-medium text-white">Agora холболт амжилтгүй</p>
            <p className="mt-1 text-sm text-white/60">
              Agora credentials буруу эсвэл сүлжээний алдаа байж болзошгүй
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
            >
              <RefreshCw className="size-4" />
              Дахин оролдох
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-slate-900 shadow-2xl',
        isFullscreen ? 'h-screen w-screen' : 'aspect-video rounded-xl border-4 border-white',
      )}
    >
      {/* Багшийн камер / screen share — LocalVideoTrack нь screen track-д зориулагдсан */}
      {isScreenSharing ? (
        <LocalVideoTrack
          track={screenTrack}
          play={true}
          className="absolute inset-0"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <LocalUser
          cameraOn={!isCameraOff}
          micOn={!isMuted}
          videoTrack={localCameraTrack}
          className="absolute inset-0"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          {/* Камер унтарсан үед placeholder */}
          {isCameraOff && (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-slate-900">
              <div className="flex flex-col items-center gap-3">
                <User className="size-16 text-white/40" />
                <p className="text-sm text-white/60">
                  {connectionState === 'CONNECTING' ? 'Холбогдож байна...' : 'Камер унтарсан байна'}
                </p>
              </div>
            </div>
          )}
        </LocalUser>
      )}

      {/* PiP камер — screen share үед чирж зөөх боломжтой жижиг камер */}
      {isScreenSharing && !isCameraOff && (
        <div
          ref={pipRef}
          onPointerDown={onPipPointerDown}
          onPointerMove={onPipPointerMove}
          onPointerUp={onPipPointerUp}
          className="absolute bottom-20 left-4 z-20 h-[120px] w-[160px] cursor-grab overflow-hidden rounded-xl border-2 border-white/30 shadow-2xl active:cursor-grabbing"
          style={{ transform: `translate(${pipPos.x}px, ${pipPos.y}px)`, touchAction: 'none' }}
        />
      )}

      {/* Оролцогчдын жижиг preview — баруун дээд */}
      {remoteUsers.length > 0 && (
        <div className="absolute right-3 top-14 z-10 flex flex-col gap-1.5">
          {remoteUsers.slice(0, 3).map((user) => (
            <div
              key={user.uid}
              className="h-12 w-16 overflow-hidden rounded-md border border-white/20"
            >
              <RemoteUser user={user} className="h-full w-full" />
            </div>
          ))}
          {remoteUsers.length > 3 && (
            <div className="flex h-12 w-16 items-center justify-center rounded-md border border-white/20 bg-black/50 text-xs font-bold text-white">
              +{remoteUsers.length - 3}
            </div>
          )}
        </div>
      )}

      {/* LIVE badge + Timer */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
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

      {/* Оролцогчдын тоо */}
      {remoteUsers.length > 0 && (
        <div className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
          <User className="size-3" />
          <span>{remoteUsers.length}</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex gap-3">
          <button
            onClick={onToggleMute}
            className={cn(
              'flex size-10 items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors',
              isMuted ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/20 hover:bg-white/40',
            )}
            title={isMuted ? 'Микрофон асаах' : 'Микрофон унтраах'}
          >
            {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>
          <button
            onClick={onToggleCamera}
            className={cn(
              'flex size-10 items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors',
              isCameraOff ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/20 hover:bg-white/40',
            )}
            title={isCameraOff ? 'Камер асаах' : 'Камер унтраах'}
          >
            {isCameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
          </button>
          <button
            onClick={onScreenShare}
            className={cn(
              'flex size-10 items-center justify-center rounded-full text-white backdrop-blur-sm transition-colors',
              isScreenSharing ? 'bg-primary/80 hover:bg-primary' : 'bg-white/20 hover:bg-white/40',
            )}
            title={isScreenSharing ? 'Дэлгэц хуваалцахаа зогсоох' : 'Дэлгэц хуваалцах'}
          >
            <MonitorUp className="size-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
            title={isFullscreen ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэц'}
          >
            {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
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

/**
 * Багшийн бодит Agora видео classroom.
 * AgoraRTCProvider wrapper + inner teacher room.
 */
export function AgoraTeacherRoom(props: AgoraTeacherRoomProps) {
  /** Mount бүрт шинэ client үүсгэнэ — module-level singleton ашиглахгүй.
   *  Ингэснээр remount дээр хуучин published tracks-ийн conflict гарахгүй. */
  const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);
  return (
    <AgoraRTCProvider client={client}>
      <AgoraTeacherRoomInner {...props} />
    </AgoraRTCProvider>
  );
}
