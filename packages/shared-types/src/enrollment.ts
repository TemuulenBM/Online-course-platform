export type EnrollmentStatus = 'active' | 'completed' | 'cancelled' | 'expired';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  expiresAt?: string;
  completedAt?: string;
}

export interface EnrollmentWithCourse extends Enrollment {
  createdAt: string;
  updatedAt: string;
  courseTitle?: string;
  courseSlug?: string;
  courseThumbnailUrl?: string;
  courseInstructorName?: string;
  userName?: string;
  userEmail?: string;
}

export interface EnrollmentListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EnrollmentListResponse {
  data: EnrollmentWithCourse[];
  meta: EnrollmentListMeta;
}

export interface EnrollmentCheck {
  isEnrolled: boolean;
  enrollment?: Enrollment;
}
