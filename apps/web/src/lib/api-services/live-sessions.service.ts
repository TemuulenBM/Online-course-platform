import type {
  ApiResponse,
  PaginatedResponse,
  LiveSession,
  SessionAttendee,
  JoinSessionResponse,
  StartSessionResponse,
  AgoraTokenResponse,
  CreateLiveSessionData,
  UpdateLiveSessionData,
} from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Session жагсаалтын параметрүүд */
export interface LiveSessionListParams {
  page?: number;
  limit?: number;
  status?: string;
}

/** Ирцийн жагсаалтын параметрүүд */
export interface AttendeeListParams {
  page?: number;
  limit?: number;
}

export const liveSessionsService = {
  /** Session товлох (TEACHER/ADMIN) */
  create: async (data: CreateLiveSessionData): Promise<LiveSession> => {
    const res = await client.post<ApiResponse<LiveSession>>('/live-sessions', data);
    return res.data.data!;
  },

  /** Удахгүй эхлэх sessions (@Public) */
  listUpcoming: async (params?: LiveSessionListParams): Promise<PaginatedResponse<LiveSession>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<LiveSession>>>(
      '/live-sessions/upcoming',
      { params },
    );
    return res.data.data!;
  },

  /** Сургалтын sessions (JWT required) */
  listByCourse: async (
    courseId: string,
    params?: LiveSessionListParams,
  ): Promise<PaginatedResponse<LiveSession>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<LiveSession>>>(
      `/live-sessions/course/${courseId}`,
      { params },
    );
    return res.data.data!;
  },

  /** Хичээлийн session (@Public) */
  getByLesson: async (lessonId: string): Promise<LiveSession> => {
    const res = await client.get<ApiResponse<LiveSession>>(`/live-sessions/lesson/${lessonId}`);
    return res.data.data!;
  },

  /** Session дэлгэрэнгүй (JWT required) */
  getById: async (id: string): Promise<LiveSession> => {
    const res = await client.get<ApiResponse<LiveSession>>(`/live-sessions/${id}`);
    return res.data.data!;
  },

  /** Session шинэчлэх (owner/ADMIN, SCHEDULED only) */
  update: async (id: string, data: UpdateLiveSessionData): Promise<LiveSession> => {
    const res = await client.patch<ApiResponse<LiveSession>>(`/live-sessions/${id}`, data);
    return res.data.data!;
  },

  /** Session цуцлах (owner/ADMIN, SCHEDULED only) */
  cancel: async (id: string): Promise<LiveSession> => {
    const res = await client.delete<ApiResponse<LiveSession>>(`/live-sessions/${id}`);
    return res.data.data!;
  },

  /** Session эхлүүлэх (instructor only, SCHEDULED→LIVE) */
  start: async (id: string): Promise<StartSessionResponse> => {
    const res = await client.post<ApiResponse<StartSessionResponse>>(`/live-sessions/${id}/start`);
    return res.data.data!;
  },

  /** Session дуусгах (instructor only, LIVE→ENDED) */
  end: async (id: string): Promise<LiveSession> => {
    const res = await client.post<ApiResponse<LiveSession>>(`/live-sessions/${id}/end`);
    return res.data.data!;
  },

  /** Session-д нэгдэх + Agora token авах */
  join: async (id: string): Promise<JoinSessionResponse> => {
    const res = await client.post<ApiResponse<JoinSessionResponse>>(`/live-sessions/${id}/join`);
    return res.data.data!;
  },

  /** Session-оос гарах */
  leave: async (id: string): Promise<void> => {
    await client.post(`/live-sessions/${id}/leave`);
  },

  /** Ирцийн жагсаалт (instructor/ADMIN) */
  getAttendees: async (
    id: string,
    params?: AttendeeListParams,
  ): Promise<PaginatedResponse<SessionAttendee>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<SessionAttendee>>>(
      `/live-sessions/${id}/attendees`,
      { params },
    );
    return res.data.data!;
  },

  /** Agora token шинэчлэх */
  refreshToken: async (id: string): Promise<AgoraTokenResponse> => {
    const res = await client.get<ApiResponse<AgoraTokenResponse>>(`/live-sessions/${id}/token`);
    return res.data.data!;
  },
};
