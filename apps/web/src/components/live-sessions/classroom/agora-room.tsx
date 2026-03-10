'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  LocalUser,
  LocalVideoTrack,
  RemoteUser,
  useClientEvent,
  useConnectionState,
  useIsConnected,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useLocalScreenTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
} from 'agora-rtc-react';
import { AlertTriangle, RefreshCw, User } from 'lucide-react';

interface AgoraRoomProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  userName?: string;
  /** Холбогдсон/тасарсан үед дуудагдана */
  onConnectionChange?: (connected: boolean) => void;
  /** Token expire болохоор дуудагдана — шинэ token авахад ашиглана */
  onTokenWillExpire?: () => void;
}

/**
 * Agora RTC inner — AgoraRTCProvider дотор ажиллана.
 * useJoin, usePublish болон remote tracks manage хийнэ.
 */
function AgoraRoomInner({
  appId,
  channelName,
  token,
  uid,
  isMuted,
  isCameraOff,
  isScreenSharing,
  userName,
  onConnectionChange,
  onTokenWillExpire,
}: AgoraRoomProps) {
  const client = useRTCClient();

  /** Агаарт нэгдэх */
  useJoin({ appid: appId, channel: channelName, token, uid }, true);

  /** Локал медиа tracks — screen share үед camera track амьд байна, зүгээр publish хийхгүй */
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(!isMuted);
  const { localCameraTrack } = useLocalCameraTrack(!isCameraOff);
  const { screenTrack } = useLocalScreenTrack(isScreenSharing, {}, 'disable');

  /** Аудио track-г usePublish-ээр */
  usePublish([localMicrophoneTrack]);

  /** Remote users */
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  /** Remote audio автоматаар тоглуулна */
  audioTracks.forEach((track) => track.play());

  /** Холболтын state */
  const isConnected = useIsConnected();
  const connectionState = useConnectionState();

  /** Видео track-г гараар удирдах — camera ↔ screen share.
   *  await unpublish → await publish дарааллаар race condition-г шийдэж байна. */
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
      } catch (err) {
        console.warn('[Agora] Видео track солих алдаа:', err);
      }
    };

    switchVideoTrack();

    return () => {
      cancelled = true;
    };
  }, [isScreenSharing, screenTrack, localCameraTrack, connectionState, isCameraOff, client]);
  const [connectionTimedOut, setConnectionTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** CONNECTING state-д 15 сек-ээс илүү байвал timeout */
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
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  /** Token expire callback */
  useClientEvent(client, 'token-privilege-will-expire', () => {
    onTokenWillExpire?.();
  });

  /** Instructor-ийн видео (эхний remote user) */
  const instructor = remoteUsers[0];
  const others = remoteUsers.slice(1);

  return (
    <div className="absolute inset-0 bg-slate-900">
      {/* Үндсэн видео — instructor эсвэл connecting */}
      {instructor ? (
        <RemoteUser user={instructor} className="h-full w-full" style={{ objectFit: 'cover' }} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          {connectionTimedOut && connectionState !== 'CONNECTED' ? (
            <>
              <AlertTriangle className="size-16 text-red-400" />
              <p className="text-sm font-medium text-white">Agora холболт амжилтгүй</p>
              <p className="text-xs text-white/50">Сүлжээ эсвэл Agora тохиргоо шалгана уу</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
              >
                <RefreshCw className="size-3" />
                Дахин оролдох
              </button>
            </>
          ) : connectionState === 'CONNECTING' || connectionState === 'RECONNECTING' ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative size-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="size-8 text-primary/60" />
                </div>
              </div>
              <p className="text-sm text-white/60">Багш холбогдохыг хүлээж байна...</p>
            </>
          ) : (
            <>
              <User className="size-16 text-white/20" />
              <p className="text-sm text-white/40">Видео дамжуулалт эхлэхгүй байна</p>
            </>
          )}
        </div>
      )}

      {/* Self-view — баруун доод булан */}
      <div className="absolute bottom-20 right-4 h-20 w-28 overflow-hidden rounded-lg border-2 border-white/20 shadow-lg">
        {isScreenSharing ? (
          <LocalVideoTrack
            track={screenTrack}
            play={true}
            className="h-full w-full"
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <LocalUser
            cameraOn={!isCameraOff}
            micOn={!isMuted}
            videoTrack={localCameraTrack}
            className="h-full w-full"
          >
            {/* Камер унтарсан үед placeholder */}
            {isCameraOff && (
              <div className="flex h-full w-full items-center justify-center bg-slate-800">
                <div className="flex flex-col items-center gap-1">
                  <User className="size-6 text-white/40" />
                  <span className="truncate max-w-[80px] px-1 text-[10px] text-white/40">
                    {userName ?? 'Та'}
                  </span>
                </div>
              </div>
            )}
          </LocalUser>
        )}
      </div>

      {/* Бусад оролцогчид — баруун дээд */}
      {others.length > 0 && (
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          {others.slice(0, 4).map((user) => (
            <div
              key={user.uid}
              className="h-16 w-24 overflow-hidden rounded-lg border border-white/20"
            >
              <RemoteUser user={user} className="h-full w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Студентын бодит Agora видео room.
 * AgoraRTCProvider wrapper + inner room.
 */
export function AgoraRoom(props: AgoraRoomProps) {
  /** Mount бүрт шинэ client үүсгэнэ — module-level singleton ашиглахгүй.
   *  Ингэснээр remount дээр хуучин published tracks-ийн conflict гарахгүй. */
  const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);
  return (
    <AgoraRTCProvider client={client}>
      <AgoraRoomInner {...props} />
    </AgoraRTCProvider>
  );
}
