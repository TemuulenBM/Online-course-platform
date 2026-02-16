/**
 * Хичээлийн домэйн entity.
 * PostgreSQL-ийн Lesson моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class LessonEntity {
  readonly id: string;
  readonly courseId: string;
  readonly title: string;
  readonly orderIndex: number;
  readonly lessonType: string;
  readonly durationMinutes: number;
  readonly isPreview: boolean;
  readonly isPublished: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly courseTitle?: string;
  readonly courseInstructorId?: string;

  constructor(props: {
    id: string;
    courseId: string;
    title: string;
    orderIndex: number;
    lessonType: string;
    durationMinutes: number;
    isPreview: boolean;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    courseTitle?: string;
    courseInstructorId?: string;
  }) {
    this.id = props.id;
    this.courseId = props.courseId;
    this.title = props.title;
    this.orderIndex = props.orderIndex;
    this.lessonType = props.lessonType;
    this.durationMinutes = props.durationMinutes;
    this.isPreview = props.isPreview;
    this.isPublished = props.isPublished;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.courseTitle = props.courseTitle;
    this.courseInstructorId = props.courseInstructorId;
  }

  /** Хичээлийн мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      courseId: this.courseId,
      title: this.title,
      orderIndex: this.orderIndex,
      lessonType: this.lessonType,
      durationMinutes: this.durationMinutes,
      isPreview: this.isPreview,
      isPublished: this.isPublished,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      courseTitle: this.courseTitle,
    };
  }
}
