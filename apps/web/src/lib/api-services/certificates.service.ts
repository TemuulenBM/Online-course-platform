import type { ApiResponse, PaginatedResponse } from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

/** Сертификатын бүтэц */
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  certificateNumber: string;
  verificationCode: string;
  pdfUrl: string | null;
  qrCodeUrl: string | null;
  generatedAt: string;
}

export interface MyCertificatesParams {
  page?: number;
  limit?: number;
}

export const certificatesService = {
  listMy: async (params?: MyCertificatesParams): Promise<PaginatedResponse<Certificate>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<Certificate>>>('/certificates/my', {
      params,
    });
    return res.data.data!;
  },
};
