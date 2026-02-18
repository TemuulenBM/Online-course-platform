/**
 * Хэрэглэгчийн ахицын домэйн entity.
 * PostgreSQL-ийн UserProgress моделийг бизнес логикийн түвшинд төлөөлнө.
 */
export class UserProgressEntity {
  readonly id: string;
  readonly userId: string;
  readonly lessonId: string;
  readonly progressPercentage: number;
  readonly completed: boolean;
  readonly timeSpentSeconds: number;
  readonly lastPositionSeconds: number;
  readonly completedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Хичээлийн нэр — response-д харуулах */
  readonly lessonTitle?: string;
  /** Хичээлийн төрөл — progress тооцооллонд */
  readonly lessonType?: string;
  /** Сургалтын ID — course-level progress-д */
  readonly courseId?: string;
  /** Хичээлийн дараалал — response-д */
  readonly lessonOrderIndex?: number;

  constructor(props: {
    id: string;
    userId: string;
    lessonId: string;
    progressPercentage: number;
    completed: boolean;
    timeSpentSeconds: number;
    lastPositionSeconds: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    lessonTitle?: string;
    lessonType?: string;
    courseId?: string;
    lessonOrderIndex?: number;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.lessonId = props.lessonId;
    this.progressPercentage = props.progressPercentage;
    this.completed = props.completed;
    this.timeSpentSeconds = props.timeSpentSeconds;
    this.lastPositionSeconds = props.lastPositionSeconds;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lessonTitle = props.lessonTitle;
    this.lessonType = props.lessonType;
    this.courseId = props.courseId;
    this.lessonOrderIndex = props.lessonOrderIndex;
  }

  /** Ахицын мэдээллийг response хэлбэрээр буцаана */
  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      lessonId: this.lessonId,
      progressPercentage: this.progressPercentage,
      completed: this.completed,
      timeSpentSeconds: this.timeSpentSeconds,
      lastPositionSeconds: this.lastPositionSeconds,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lessonTitle: this.lessonTitle,
      lessonType: this.lessonType,
      courseId: this.courseId,
      lessonOrderIndex: this.lessonOrderIndex,
    };
  }
}
