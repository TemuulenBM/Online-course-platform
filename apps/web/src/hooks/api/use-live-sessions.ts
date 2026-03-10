'use client';

import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { liveSessionsService } from '@/lib/api-services/live-sessions.service';
import type {
  LiveSessionListParams,
  AttendeeListParams,
} from '@/lib/api-services/live-sessions.service';
import type { CreateLiveSessionData, UpdateLiveSessionData } from '@ocp/shared-types';
import { QUERY_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';

// --- Queries ---

/** Удахгүй эхлэх sessions (@Public) */
export function useUpcomingSessions(params?: LiveSessionListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.liveSessions.upcoming(params),
    queryFn: () => liveSessionsService.listUpcoming(params),
  });
}

/** Сургалтын sessions (JWT required) */
export function useCourseSessions(courseId: string, params?: LiveSessionListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.liveSessions.byCourse(courseId, params),
    queryFn: () => liveSessionsService.listByCourse(courseId, params),
    enabled: !!courseId,
  });
}

/** Хичээлийн session (@Public) */
export function useLessonSession(lessonId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.liveSessions.byLesson(lessonId),
    queryFn: () => liveSessionsService.getByLesson(lessonId),
    enabled: !!lessonId,
  });
}

/** Session дэлгэрэнгүй (JWT required) */
export function useLiveSessionDetail(id: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.liveSessions.detail(id),
    queryFn: () => liveSessionsService.getById(id),
    enabled: !!id && isAuthenticated,
  });
}

/** Ирцийн жагсаалт (instructor/ADMIN) */
export function useSessionAttendees(
  id: string,
  params?: AttendeeListParams,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: QUERY_KEYS.liveSessions.attendees(id, params),
    queryFn: () => liveSessionsService.getAttendees(id, params),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}

// --- Mutations ---

/** Session товлох (TEACHER/ADMIN) */
export function useCreateLiveSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLiveSessionData) => liveSessionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
    },
  });
}

/** Session шинэчлэх */
export function useUpdateLiveSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLiveSessionData }) =>
      liveSessionsService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.liveSessions.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
    },
  });
}

/** Session цуцлах */
export function useCancelLiveSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => liveSessionsService.cancel(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.liveSessions.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
    },
  });
}

/** Session эхлүүлэх (SCHEDULED→LIVE) */
export function useStartLiveSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => liveSessionsService.start(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.liveSessions.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
    },
  });
}

/** Session дуусгах (LIVE→ENDED) */
export function useEndLiveSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => liveSessionsService.end(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.liveSessions.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
    },
  });
}

/** Session-д нэгдэх + Agora token авах */
export function useJoinLiveSession() {
  return useMutation({
    mutationFn: (id: string) => liveSessionsService.join(id),
  });
}

/** Session-оос гарах */
export function useLeaveLiveSession() {
  return useMutation({
    mutationFn: (id: string) => liveSessionsService.leave(id),
  });
}

/** Agora token шинэчлэх (token expiry эсвэл bagsh start хийсний дараа uid/appId авах) */
export function useRefreshAgoraToken() {
  return useMutation({
    mutationFn: (id: string) => liveSessionsService.refreshToken(id),
  });
}

/** Бүх sessions — Admin удирдлагад ашиглагдана (timeFilter=all) */
export function useAllLiveSessions(params?: LiveSessionListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.liveSessions.upcoming({ ...params, timeFilter: 'all' }),
    queryFn: () => liveSessionsService.listUpcoming({ ...params, timeFilter: 'all' }),
  });
}

/** Олон сургалтын sessions-г зэрэг авч нэгтгэнэ — Teacher overview-д */
export function useAllCourseSessions(courseIds: string[]) {
  const queries = useQueries({
    queries: courseIds.map((id) => ({
      queryKey: QUERY_KEYS.liveSessions.byCourse(id, { limit: 50 }),
      queryFn: () => liveSessionsService.listByCourse(id, { limit: 50 }),
      enabled: !!id,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  const { allSessions, liveSessions, upcomingSessions, stats } = useMemo(() => {
    const all = queries.flatMap((q) => q.data?.data ?? []);
    const live = all.filter((s) => s.status === 'live');
    const upcoming = all
      .filter((s) => s.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
    const ended = all.filter((s) => s.status === 'ended');

    return {
      allSessions: all,
      liveSessions: live,
      upcomingSessions: upcoming,
      stats: {
        liveCount: live.length,
        scheduledCount: upcoming.length,
        endedCount: ended.length,
        totalCount: all.length,
      },
    };
  }, [queries]);

  return { queries, allSessions, liveSessions, upcomingSessions, stats, isLoading };
}
