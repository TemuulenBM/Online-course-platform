import type { ApiResponse, PaginatedResponse, Certificate } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Миний сертификатуудын хайлтын параметрүүд */
export interface MyCertificatesParams {
  page?: number;
  limit?: number;
}

/** Сургалтын сертификатуудын хайлтын параметрүүд */
export interface CourseCertificatesParams {
  page?: number;
  limit?: number;
}

export const certificatesService = {
  /** Миний сертификатууд (pagination) */
  listMy: async (params?: MyCertificatesParams): Promise<PaginatedResponse<Certificate>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<Certificate>>>('/certificates/my', {
      params,
    });
    return res.data.data!;
  },

  /** Сертификатын дэлгэрэнгүй */
  getById: async (id: string): Promise<Certificate> => {
    const res = await client.get<ApiResponse<Certificate>>(`/certificates/${id}`);
    return res.data.data!;
  },

  /** Сертификат баталгаажуулах (public, JWT шаардлагагүй) */
  verify: async (verificationCode: string): Promise<Certificate> => {
    const res = await client.get<ApiResponse<Certificate>>(
      `/certificates/verify/${verificationCode}`,
    );
    return res.data.data!;
  },

  /** Сургалтын сертификатуудын жагсаалт (TEACHER/ADMIN) */
  listByCourse: async (
    courseId: string,
    params?: CourseCertificatesParams,
  ): Promise<PaginatedResponse<Certificate>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<Certificate>>>(
      `/certificates/course/${courseId}`,
      { params },
    );
    return res.data.data!;
  },

  /** Сертификат гараар үүсгэх (COMPLETED enrollment шаардлагатай) */
  generate: async (courseId: string): Promise<Certificate> => {
    const res = await client.post<ApiResponse<Certificate>>(`/certificates/generate/${courseId}`);
    return res.data.data!;
  },

  /** Сертификат устгах (ADMIN only) */
  deleteCertificate: async (id: string): Promise<void> => {
    await client.delete(`/certificates/${id}`);
  },
};
