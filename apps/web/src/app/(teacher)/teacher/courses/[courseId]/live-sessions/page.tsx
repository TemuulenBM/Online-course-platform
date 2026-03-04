'use client';

import { use, useCallback } from 'react';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import {
  useCourseSessions,
  useCourseLessons,
  useCreateLiveSession,
  useStartLiveSession,
  useEndLiveSession,
  useCancelLiveSession,
  useCourseById,
  useRefreshAgoraToken,
} from '@/hooks/api';
import { useLiveSessionStore } from '@/stores/live-session-store';
import { AgoraPlaceholder } from '@/components/live-sessions/teacher/agora-placeholder';
import { ActiveSessionDetails } from '@/components/live-sessions/teacher/active-session-details';
import { SessionListSidebar } from '@/components/live-sessions/teacher/session-list-sidebar';
import { SessionStatsCards } from '@/components/live-sessions/teacher/session-stats-cards';
import { CreateSessionDialog } from '@/components/live-sessions/teacher/create-session-dialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import type { LiveSession, CreateLiveSessionData } from '@ocp/shared-types';

/** NEXT_PUBLIC_AGORA_APP_ID — frontend-д ашиглагдах public Agora App ID */
const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? '';

/**
 * Багшийн session удирдлага — /teacher/courses/[courseId]/live-sessions
 */
export default function TeacherLiveSessionsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data: course } = useCourseById(courseId);
  const { data: sessionsPaginated, isLoading } = useCourseSessions(courseId);
  const { data: lessons } = useCourseLessons(courseId);

  const createMutation = useCreateLiveSession();
  const startMutation = useStartLiveSession();
  const endMutation = useEndLiveSession();
  const cancelMutation = useCancelLiveSession();
  const refreshTokenMutation = useRefreshAgoraToken();

  const store = useLiveSessionStore();
  const {
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    elapsedSeconds,
    updateToken,
  } = store;

  const sessions = sessionsPaginated?.data ?? [];
  const activeSession = sessions.find((s) => s.status === 'live');

  /** Өнгөрсөн хугацаа format */
  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  /** Нийт цагийн тооцоо */
  const totalHours = sessions
    .filter((s) => s.status === 'ended')
    .reduce((acc, s) => {
      const dur =
        (new Date(s.scheduledEnd).getTime() - new Date(s.scheduledStart).getTime()) / 3600000;
      return acc + dur;
    }, 0);

  /** Энэ долоо хоногийн Monday-аас эхэлсэн session-уудын цаг */
  const thisMonday = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  })();

  const weeklyHours = sessions
    .filter((s) => s.status === 'ended' && new Date(s.scheduledStart) >= thisMonday)
    .reduce((acc, s) => {
      return (
        acc + (new Date(s.scheduledEnd).getTime() - new Date(s.scheduledStart).getTime()) / 3600000
      );
    }, 0);

  const handleCreate = useCallback(
    (data: CreateLiveSessionData) => {
      createMutation.mutate(data, {
        onSuccess: () => toast.success('Шинэ хичээл амжилттай үүслээ'),
        onError: () => toast.error('Хичээл үүсгэхэд алдаа гарлаа'),
      });
    },
    [createMutation],
  );

  const handleStart = useCallback(
    (session: LiveSession) => {
      startMutation.mutate(session.id, {
        onSuccess: (res) => {
          toast.success('Хичээл эхэллээ!');
          /** Start response-оос channelName+token авсны дараа token endpoint-оос uid авна */
          refreshTokenMutation.mutate(session.id, {
            onSuccess: (tokenRes) => {
              store.initSession(
                session.id,
                res.channelName,
                tokenRes.token,
                tokenRes.uid,
                AGORA_APP_ID,
              );
            },
            onError: () => {
              /** token авч чадахгүй бол start response-ийн мэдээллээр холбогдохыг оролдоно */
              store.initSession(session.id, res.channelName, res.token, 0, AGORA_APP_ID);
            },
          });
        },
        onError: () => toast.error('Хичээл эхлүүлэхэд алдаа гарлаа'),
      });
    },
    [startMutation, refreshTokenMutation, store],
  );

  const handleEnd = useCallback(() => {
    if (!activeSession) return;
    endMutation.mutate(activeSession.id, {
      onSuccess: () => {
        toast.success('Хичээл дууслаа');
        store.clearSession();
      },
      onError: () => toast.error('Хичээл дуусгахад алдаа гарлаа'),
    });
  }, [endMutation, activeSession, store]);

  const handleDelete = useCallback(
    (session: LiveSession) => {
      cancelMutation.mutate(session.id, {
        onSuccess: () => toast.success('Хичээл цуцлагдлаа'),
        onError: () => toast.error('Хичээл цуцлахад алдаа гарлаа'),
      });
    },
    [cancelMutation],
  );

  /** Token expire — шинэ token авч store-д шинэчлэнэ */
  const handleTokenWillExpire = useCallback(() => {
    if (!activeSession) return;
    refreshTokenMutation.mutate(activeSession.id, {
      onSuccess: (res) => {
        updateToken(res.token);
      },
    });
  }, [refreshTokenMutation, activeSession, updateToken]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px] space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <div>
              {/* Breadcrumb */}
              <nav className="mb-1 flex items-center gap-1 text-sm text-slate-500">
                <Link href={ROUTES.TEACHER_COURSES} className="hover:text-primary">
                  Миний сургалтууд
                </Link>
                <ChevronRight className="size-3.5" />
                <span className="text-primary font-medium">{course?.title ?? 'Сургалт'}</span>
              </nav>
              <h1 className="text-3xl font-bold tracking-tight">Хичээлийн удирдлага</h1>
              <p className="text-slate-500">
                Өнөөдрийн товлогдсон болон явагдаж буй онлайн хичээлүүд
              </p>
            </div>
          </div>
          <CreateSessionDialog
            lessons={lessons ?? []}
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
          />
        </div>

        {/* Main grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <Skeleton className="h-[600px] rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Зүүн 2/3 */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <AgoraPlaceholder
                isLive={!!activeSession}
                elapsed={formatElapsed(elapsedSeconds)}
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                isScreenSharing={isScreenSharing}
                onToggleMute={toggleMute}
                onToggleCamera={toggleCamera}
                onScreenShare={toggleScreenShare}
                onEnd={handleEnd}
                appId={store.appId ?? undefined}
                channelName={store.channelName ?? undefined}
                token={store.agoraToken ?? undefined}
                uid={store.agoraUid ?? undefined}
                onTokenWillExpire={handleTokenWillExpire}
              />
              {activeSession && <ActiveSessionDetails session={activeSession} />}
            </div>

            {/* Баруун 1/3 */}
            <div className="flex flex-col gap-6">
              <SessionListSidebar
                sessions={sessions}
                onStart={handleStart}
                onDelete={handleDelete}
              />
              <SessionStatsCards
                totalHours={Math.round(totalHours * 10) / 10}
                weeklyHours={Math.round(weeklyHours * 10) / 10}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
