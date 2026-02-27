'use client';

import { VideoOff } from 'lucide-react';

interface SelfViewMiniProps {
  isCameraOff?: boolean;
  userName?: string;
}

/**
 * Self-view mini window — баруун дээд буланд харагдана.
 */
export function SelfViewMini({ isCameraOff, userName = 'Та' }: SelfViewMiniProps) {
  return (
    <div className="absolute right-4 top-4 z-10 aspect-video w-32 overflow-hidden rounded-lg border-2 border-white/20 bg-slate-800 shadow-lg md:w-48">
      {isCameraOff ? (
        <div className="flex size-full items-center justify-center">
          <VideoOff className="size-6 text-white/40" />
        </div>
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
          <div className="size-10 rounded-full bg-primary/30 text-center text-sm font-bold leading-10 text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
        {userName} (Миний камер)
      </div>
    </div>
  );
}
