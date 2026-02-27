import { ApiClient } from '@ocp/api-client';
import { useAuthStore } from '../stores/auth-store';

const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
});

const client = apiClient.getClient();

// --- Request interceptor: token → Authorization header ---
client.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens;
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// --- Response interceptor: 401 → refresh token → retry ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

/**
 * Queue-д хүлээж буй request-уудыг шийдвэрлэх.
 * Refresh амжилттай бол шинэ token-оор retry хийнэ.
 */
function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 биш бол шууд reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Refresh token байхгүй бол шууд logout
    const { tokens, clearAuth } = useAuthStore.getState();
    if (!tokens?.refreshToken) {
      clearAuth();
      removeCookie();
      redirectToLogin();
      return Promise.reject(error);
    }

    // Аль хэдийн refresh хийж байгаа бол queue-д нэмэх
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      });
    }

    // Refresh эхлүүлэх
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await client.post(
        '/auth/refresh',
        { refreshToken: tokens.refreshToken },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { _retry: true } as any,
      );
      const newTokens = res.data.data;
      useAuthStore.getState().setTokens(newTokens);

      processQueue(null, newTokens.accessToken);

      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      return client(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuth();
      removeCookie();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

/** Auth cookie устгах */
function removeCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'ocp-auth=; max-age=0; path=/';
  }
}

/** Login хуудас руу redirect */
function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export default apiClient;
