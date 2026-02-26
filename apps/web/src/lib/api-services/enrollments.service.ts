import type {
  ApiResponse,
  EnrollmentWithCourse,
  EnrollmentListResponse,
  EnrollmentCheck,
  EnrollmentStatus,
} from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

export interface MyEnrollmentsParams {
  page?: number;
  limit?: number;
  status?: EnrollmentStatus;
}

export interface CourseEnrollmentsParams {
  page?: number;
  limit?: number;
  status?: EnrollmentStatus;
}

export const enrollmentsService = {
  /** Сургалтад элсэх */
  enroll: async (courseId: string): Promise<EnrollmentWithCourse> => {
    const res = await client.post<ApiResponse<EnrollmentWithCourse>>('/enrollments', {
      courseId,
    });
    return res.data.data!;
  },

  /** Миний элсэлтүүдийн жагсаалт (pagination + status filter) */
  listMy: async (params?: MyEnrollmentsParams): Promise<EnrollmentListResponse> => {
    const res = await client.get<ApiResponse<EnrollmentListResponse>>('/enrollments/my', {
      params,
    });
    return res.data.data!;
  },

  /** Элсэлтийн статус шалгах */
  checkEnrollment: async (courseId: string): Promise<EnrollmentCheck> => {
    const res = await client.get<ApiResponse<EnrollmentCheck>>(`/enrollments/check/${courseId}`);
    return res.data.data!;
  },

  /** Нэг элсэлтийн дэлгэрэнгүй */
  getById: async (id: string): Promise<EnrollmentWithCourse> => {
    const res = await client.get<ApiResponse<EnrollmentWithCourse>>(`/enrollments/${id}`);
    return res.data.data!;
  },

  /** Сургалтын оюутнуудын жагсаалт (TEACHER/ADMIN) */
  listCourseEnrollments: async (
    courseId: string,
    params?: CourseEnrollmentsParams,
  ): Promise<EnrollmentListResponse> => {
    const res = await client.get<ApiResponse<EnrollmentListResponse>>(
      `/enrollments/course/${courseId}`,
      { params },
    );
    return res.data.data!;
  },

  /** Элсэлт цуцлах */
  cancel: async (id: string): Promise<EnrollmentWithCourse> => {
    const res = await client.patch<ApiResponse<EnrollmentWithCourse>>(`/enrollments/${id}/cancel`);
    return res.data.data!;
  },

  /** Элсэлт дуусгах (ADMIN only) */
  complete: async (id: string): Promise<EnrollmentWithCourse> => {
    const res = await client.patch<ApiResponse<EnrollmentWithCourse>>(
      `/enrollments/${id}/complete`,
    );
    return res.data.data!;
  },

  /** Элсэлт устгах (ADMIN only) */
  deleteEnrollment: async (id: string): Promise<void> => {
    await client.delete(`/enrollments/${id}`);
  },
};
