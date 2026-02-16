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
