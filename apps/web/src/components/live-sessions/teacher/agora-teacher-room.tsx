'use client';

import { useEffect } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  LocalUser,
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
import { Mic, MicOff, MonitorUp, User, Video, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Багшийн Agora client singleton */
const teacherClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

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

  /** Локал медиа tracks */
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(!isMuted);
  const { localCameraTrack } = useLocalCameraTrack(!isCameraOff);
  const { screenTrack } = useLocalScreenTrack(isScreenSharing, {}, 'disable');

  /** Бичлэг publish — screen share идэвхтэй бол camera оронд нь */
  usePublish([localMicrophoneTrack, isScreenSharing ? screenTrack : localCameraTrack]);

  /** Remote оролцогчдын аудио */
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  audioTracks.forEach((track) => track.play());

  const connectionState = useConnectionState();

  useEffect(() => {
    const isConnected = connectionState === 'CONNECTED';
    onConnectionChange?.(isConnected);
  }, [connectionState, onConnectionChange]);

  useClientEvent(client, 'token-privilege-will-expire', () => {
    onTokenWillExpire?.();
  });

  const isLive = connectionState === 'CONNECTED';

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border-4 border-white bg-slate-900 shadow-2xl">
      {/* Багшийн камер / screen share */}
      <LocalUser
        cameraOn={!isCameraOff}
        micOn={!isMuted}
        videoTrack={localCameraTrack}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        cover={
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-slate-900">
            <div className="flex flex-col items-center gap-3">
              <User className="size-16 text-white/40" />
              <p className="text-sm text-white/60">
                {connectionState === 'CONNECTING' ? 'Холбогдож байна...' : 'Камер унтарсан байна'}
              </p>
            </div>
          </div>
        }
      />

      {/* Оролцогчдын жижиг preview — баруун дээд */}
      {remoteUsers.length > 0 && (
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
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

      {/* Оролцогчдын тоо */}
      {remoteUsers.length > 0 && (
        <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
          <User className="size-3" />
          <span>{remoteUsers.length}</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-6">
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
  return (
    <AgoraRTCProvider client={teacherClient}>
      <AgoraTeacherRoomInner {...props} />
    </AgoraRTCProvider>
  );
}
