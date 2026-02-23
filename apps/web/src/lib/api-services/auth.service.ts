import type { ApiResponse, User, AuthTokens } from '@ocp/shared-types';
import type { LoginInput, RegisterInput } from '@ocp/validation';
import apiClient from '../api';

const client = apiClient.getClient();

/** Auth response — login/register хариунд ирдэг бүтэц */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await client.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data!;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const res = await client.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data!;
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const res = await client.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refreshToken,
    });
    return res.data.data!;
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await client.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await client.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await client.post('/auth/reset-password', { token, password });
  },
};
