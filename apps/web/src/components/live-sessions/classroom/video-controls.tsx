'use client';

import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

/**
 * Видео контролын товчнууд — mic / camera / screenshare / end call.
 */
export function VideoControls({
  isMuted,
  isCameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
}: VideoControlsProps) {
  return (
    <div className="flex items-center gap-4 rounded-full border border-white/10 bg-black/40 px-6 py-3 backdrop-blur-md">
      <ControlButton active={isMuted} onClick={onToggleMute} icon={isMuted ? MicOff : Mic} />
      <ControlButton
        active={isCameraOff}
        onClick={onToggleCamera}
        icon={isCameraOff ? VideoOff : Video}
      />
      <ControlButton
        active={isScreenSharing}
        activeColor="primary"
        onClick={onToggleScreenShare}
        icon={MonitorUp}
      />
      <div className="mx-1 h-6 w-px bg-white/20" />
      <button
        onClick={onEndCall}
        className="rounded-full bg-red-500 p-3 text-white transition-colors hover:bg-red-600"
      >
        <PhoneOff className="size-5" />
      </button>
    </div>
  );
}

function ControlButton({
  active,
  activeColor = 'red',
  onClick,
  icon: Icon,
}: {
  active: boolean;
  activeColor?: 'red' | 'primary';
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full p-3 text-white transition-colors',
        active
          ? activeColor === 'red'
            ? 'bg-red-500/80 hover:bg-red-500'
            : 'bg-primary/80 hover:bg-primary'
          : 'bg-white/10 hover:bg-white/20',
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
