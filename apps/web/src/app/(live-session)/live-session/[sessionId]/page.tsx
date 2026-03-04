'use client';

import { use, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  useLiveSessionDetail,
  useJoinLiveSession,
  useLeaveLiveSession,
  useRefreshAgoraToken,
  useSessionAttendees,
} from '@/hooks/api';
import { useLiveSessionStore } from '@/stores/live-session-store';
import { ClassroomNavbar } from '@/components/live-sessions/classroom/classroom-navbar';
import { VideoContainer } from '@/components/live-sessions/classroom/video-container';
import { SessionTabs } from '@/components/live-sessions/classroom/session-tabs';
import { SessionInfoSidebar } from '@/components/live-sessions/classroom/session-info-sidebar';
import { ReactionOverlay } from '@/components/live-sessions/classroom/reaction-overlay';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

/** NEXT_PUBLIC_AGORA_APP_ID — frontend-д ашиглагдах public Agora App ID */
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? '';

/**
 * Оюутны live classroom — /live-session/[sessionId]
 */
export default function LiveClassroomPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();

  const { data: session, isLoading } = useLiveSessionDetail(sessionId);
  const joinMutation = useJoinLiveSession();
  const leaveMutation = useLeaveLiveSession();
  const refreshTokenMutation = useRefreshAgoraToken();
  const { data: attendeesPaginated } = useSessionAttendees(sessionId, undefined, {
    refetchInterval: 10000,
  });

  const store = useLiveSessionStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Mount: session-д нэгдэх */
  useEffect(() => {
    if (!AGORA_APP_ID) {
      toast.error('NEXT_PUBLIC_AGORA_APP_ID тохируулаагүй байна');
    }

    joinMutation.mutate(sessionId, {
      onSuccess: (res) => {
        store.initSession(sessionId, res.channelName, res.token, res.uid, AGORA_APP_ID);
      },
      onError: () => {
        toast.error('Хичээлд нэгдэхэд алдаа гарлаа');
        router.push(ROUTES.LIVE_SESSIONS);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  /** Agora connection change — connected болоход timer эхлүүлнэ */
  const handleConnectionChange = useCallback(
    (connected: boolean) => {
      store.setConnected(connected);
      if (connected && !timerRef.current) {
        timerRef.current = setInterval(() => {
          store.incrementElapsed();
        }, 1000);
      }
    },
    [store],
  );

  /** Token expire — шинэ token авч store-д шинэчлэнэ */
  const handleTokenWillExpire = useCallback(() => {
    refreshTokenMutation.mutate(sessionId, {
      onSuccess: (res) => {
        store.updateToken(res.token);
      },
    });
  }, [refreshTokenMutation, sessionId, store]);

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  /** Гарах handler */
  const handleLeave = () => {
    leaveMutation.mutate(sessionId);
    store.clearSession();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    router.push(ROUTES.LIVE_SESSIONS);
  };

  const durationMinutes = session
    ? Math.round(
        (new Date(session.scheduledEnd).getTime() - new Date(session.scheduledStart).getTime()) /
          60000,
      )
    : 90;

  const attendees = attendeesPaginated?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="border-b p-3">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ClassroomNavbar onLeave={handleLeave} />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-4 md:p-6 lg:flex-row lg:p-8">
        {/* Видео хэсэг */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="mb-2 flex flex-col gap-1">
            <h1 className="text-2xl font-bold md:text-3xl">{session?.title ?? 'Шууд хичээл'}</h1>
            {session?.instructorName && (
              <p className="text-sm font-medium text-slate-500">Багш: {session.instructorName}</p>
            )}
          </div>

          <VideoContainer
            appId={store.appId ?? undefined}
            channelName={store.channelName ?? undefined}
            token={store.agoraToken ?? undefined}
            uid={store.agoraUid ?? undefined}
            isConnecting={store.isConnecting}
            isConnected={store.isConnected}
            isMuted={store.isMuted}
            isCameraOff={store.isCameraOff}
            isScreenSharing={store.isScreenSharing}
            userName="Та"
            onToggleMute={store.toggleMute}
            onToggleCamera={store.toggleCamera}
            onToggleScreenShare={store.toggleScreenShare}
            onEndCall={handleLeave}
            onConnectionChange={handleConnectionChange}
            onTokenWillExpire={handleTokenWillExpire}
          />

          {/* Reactions */}
          <ReactionOverlay />

          {/* Tabs */}
          <SessionTabs
            activeTab={store.activeTab}
            onTabChange={store.setActiveTab}
            sessionTitle={session?.title}
            sessionDescription={session?.description ?? undefined}
            instructorName={session?.instructorName}
          />
        </div>

        {/* Sidebar */}
        <SessionInfoSidebar
          elapsedSeconds={store.elapsedSeconds}
          durationMinutes={durationMinutes}
          attendees={attendees}
          instructorName={session?.instructorName}
        />
      </main>
    </div>
  );
}
