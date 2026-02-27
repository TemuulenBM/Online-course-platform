'use client';

import { create } from 'zustand';

/** Live classroom-ын бодит цагийн state */
interface LiveSessionState {
  /** Session ID */
  sessionId: string | null;
  /** Agora channel нэр */
  channelName: string | null;
  /** Agora token */
  agoraToken: string | null;
  /** Agora UID */
  agoraUid: number | null;

  /** Холболтын state */
  isConnected: boolean;
  isConnecting: boolean;

  /** Медиа controls */
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;

  /** Хичээлийн өнгөрсөн хугацаа (секундаар) */
  elapsedSeconds: number;

  /** Видео доорх идэвхтэй таб */
  activeTab: 'info' | 'notes' | 'qa';

  /** Actions */
  initSession: (sessionId: string, channelName: string, token: string, uid: number) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  setElapsedSeconds: (seconds: number) => void;
  incrementElapsed: () => void;
  setActiveTab: (tab: 'info' | 'notes' | 'qa') => void;
  clearSession: () => void;
}

/** Live session Zustand store — persist хийхгүй (refresh дээр session дахин холбогдоно) */
export const useLiveSessionStore = create<LiveSessionState>((set) => ({
  sessionId: null,
  channelName: null,
  agoraToken: null,
  agoraUid: null,
  isConnected: false,
  isConnecting: false,
  isMuted: false,
  isCameraOff: false,
  isScreenSharing: false,
  elapsedSeconds: 0,
  activeTab: 'info',

  initSession: (sessionId, channelName, token, uid) =>
    set({
      sessionId,
      channelName,
      agoraToken: token,
      agoraUid: uid,
      isConnecting: true,
      isConnected: false,
    }),

  setConnected: (connected) => set({ isConnected: connected, isConnecting: false }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  toggleCamera: () => set((s) => ({ isCameraOff: !s.isCameraOff })),
  toggleScreenShare: () => set((s) => ({ isScreenSharing: !s.isScreenSharing })),
  setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
  incrementElapsed: () => set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),
  setActiveTab: (tab) => set({ activeTab: tab }),

  clearSession: () =>
    set({
      sessionId: null,
      channelName: null,
      agoraToken: null,
      agoraUid: null,
      isConnected: false,
      isConnecting: false,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
      elapsedSeconds: 0,
      activeTab: 'info',
    }),
}));
