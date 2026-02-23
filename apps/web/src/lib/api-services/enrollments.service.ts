import type {
  ApiResponse,
  Enrollment,
  EnrollmentStatus,
  PaginatedResponse,
} from '@ocp/shared-types';
import apiClient from '../api';

const client = apiClient.getClient();

export interface MyEnrollmentsParams {
  page?: number;
  limit?: number;
  status?: EnrollmentStatus;
}

/** Enrollment жагсаалтын response — course мэдээлэлтэй */
export interface EnrollmentWithCourse extends Enrollment {
  courseTitle?: string;
  courseSlug?: string;
  courseThumbnailUrl?: string;
  courseInstructorName?: string;
}

/** Элсэлтийн статус шалгах response */
export interface EnrollmentCheck {
  isEnrolled: boolean;
  enrollment?: Enrollment;
}

export const enrollmentsService = {
  enroll: async (courseId: string): Promise<Enrollment> => {
    const res = await client.post<ApiResponse<Enrollment>>('/enrollments', {
      courseId,
    });
    return res.data.data!;
  },

  listMy: async (
    params?: MyEnrollmentsParams,
  ): Promise<PaginatedResponse<EnrollmentWithCourse>> => {
    const res = await client.get<ApiResponse<PaginatedResponse<EnrollmentWithCourse>>>(
      '/enrollments/my',
      { params },
    );
    return res.data.data!;
  },

  checkEnrollment: async (courseId: string): Promise<EnrollmentCheck> => {
    const res = await client.get<ApiResponse<EnrollmentCheck>>(`/enrollments/check/${courseId}`);
    return res.data.data!;
  },
};
