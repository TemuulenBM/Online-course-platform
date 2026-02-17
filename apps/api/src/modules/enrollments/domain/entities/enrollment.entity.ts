/**
 * Элсэлтийн домэйн entity.
 * PostgreSQL-ийн Enrollment моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class EnrollmentEntity {
  readonly id: string;
  readonly userId: string;
  readonly courseId: string;
  readonly status: string;
  readonly enrolledAt: Date;
  readonly expiresAt: Date | null;
  readonly completedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Сургалтын нэр — жагсаалтад харуулахад */
  readonly courseTitle?: string;
  /** Сургалтын slug — линк үүсгэхэд */
  readonly courseSlug?: string;
  /** Сургалтын зураг */
  readonly courseThumbnailUrl?: string;
  /** Сургалтын эзэмшигчийн ID — эрхийн шалгалтад (response-д буцаахгүй) */
  readonly courseInstructorId?: string;
  /** Хэрэглэгчийн нэр — багш/админ харагдац */
  readonly userName?: string;
  /** Хэрэглэгчийн имэйл — багш/админ харагдац */
  readonly userEmail?: string;

  constructor(props: {
    id: string;
    userId: string;
    courseId: string;
    status: string;
    enrolledAt: Date;
    expiresAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    courseTitle?: string;
    courseSlug?: string;
    courseThumbnailUrl?: string;
    courseInstructorId?: string;
    userName?: string;
    userEmail?: string;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.courseId = props.courseId;
    this.status = props.status;
    this.enrolledAt = props.enrolledAt;
    this.expiresAt = props.expiresAt;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.courseTitle = props.courseTitle;
    this.courseSlug = props.courseSlug;
    this.courseThumbnailUrl = props.courseThumbnailUrl;
    this.courseInstructorId = props.courseInstructorId;
    this.userName = props.userName;
    this.userEmail = props.userEmail;
  }

  /** Элсэлтийн мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      courseId: this.courseId,
      status: this.status,
      enrolledAt: this.enrolledAt,
      expiresAt: this.expiresAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      courseTitle: this.courseTitle,
      courseSlug: this.courseSlug,
      courseThumbnailUrl: this.courseThumbnailUrl,
      userName: this.userName,
      userEmail: this.userEmail,
    };
  }
}
