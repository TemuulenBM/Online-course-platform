'use client';

import { useEffect } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  LocalUser,
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
import { User } from 'lucide-react';

/** Agora RTC client singleton — module level-д үүсгэнэ */
const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

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

  /** Локал медиа tracks */
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(!isMuted);
  const { localCameraTrack } = useLocalCameraTrack(!isCameraOff);
  const { screenTrack } = useLocalScreenTrack(isScreenSharing, {}, 'disable');

  /** Бичлэг publish хийх — screen share идэвхтэй бол camera-г оронд нь дамжуулна */
  usePublish([localMicrophoneTrack, isScreenSharing ? screenTrack : localCameraTrack]);

  /** Remote users */
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  /** Remote audio автоматаар тоглуулна */
  audioTracks.forEach((track) => track.play());

  /** Холболтын state */
  const isConnected = useIsConnected();
  const connectionState = useConnectionState();

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
          {connectionState === 'CONNECTING' || connectionState === 'RECONNECTING' ? (
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
        <LocalUser
          cameraOn={!isCameraOff}
          micOn={!isMuted}
          videoTrack={localCameraTrack}
          cover={
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <div className="flex flex-col items-center gap-1">
                <User className="size-6 text-white/40" />
                <span className="text-[10px] text-white/40 truncate max-w-[80px] px-1">
                  {userName ?? 'Та'}
                </span>
              </div>
            </div>
          }
        />
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
  return (
    <AgoraRTCProvider client={agoraClient}>
      <AgoraRoomInner {...props} />
    </AgoraRTCProvider>
  );
}
