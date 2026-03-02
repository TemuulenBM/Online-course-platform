/** Live session статусууд */
export type LiveSessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

/** Live session-ийн бүтэц — backend response-тай тааруулсан */
export interface LiveSession {
  id: string;
  lessonId: string;
  instructorId: string;
  title: string;
  description: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  meetingUrl: string | null;
  meetingId: string | null;
  recordingUrl: string | null;
  status: LiveSessionStatus;
  createdAt: string;
  updatedAt: string;
  /** Join query-ээс ирэх холбоос мэдээлэл */
  lessonTitle?: string;
  courseId?: string;
  courseTitle?: string;
  courseSlug?: string;
  instructorName?: string;
  attendeeCount?: number;
}

/** Session оролцогчийн бүтэц */
export interface SessionAttendee {
  id: string;
  liveSessionId: string;
  userId: string;
  joinedAt: string;
  leftAt: string | null;
  durationMinutes: number;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

/** Join session response — Agora token-тэй */
export interface JoinSessionResponse {
  session: LiveSession;
  token: string;
  channelName: string;
  uid: number;
}

/** Start session response — Agora token-тэй */
export interface StartSessionResponse {
  session: LiveSession;
  token: string;
  channelName: string;
}

/** Agora token refresh response */
export interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: number;
  appId: string;
}

/** Session үүсгэх DTO */
export interface CreateLiveSessionData {
  lessonId: string;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
}

/** Session шинэчлэх DTO */
export interface UpdateLiveSessionData {
  title?: string;
  description?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}
