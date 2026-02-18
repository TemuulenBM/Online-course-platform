/**
 * Quiz domain entity.
 * PostgreSQL-ийн quizzes хүснэгтийн бизнес логикийн төлөөлөл.
 */
export class QuizEntity {
  readonly id: string;
  readonly lessonId: string;
  readonly title: string;
  readonly description: string | null;
  readonly timeLimitMinutes: number | null;
  readonly passingScorePercentage: number;
  readonly randomizeQuestions: boolean;
  readonly randomizeOptions: boolean;
  readonly maxAttempts: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  /** Lesson-ээс нэмэгдсэн мэдээлэл */
  readonly lessonTitle?: string;
  readonly lessonType?: string;
  readonly courseId?: string;
  readonly instructorId?: string;

  constructor(props: {
    id: string;
    lessonId: string;
    title: string;
    description: string | null;
    timeLimitMinutes: number | null;
    passingScorePercentage: number;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    maxAttempts: number | null;
    createdAt: Date;
    updatedAt: Date;
    lessonTitle?: string;
    lessonType?: string;
    courseId?: string;
    instructorId?: string;
  }) {
    this.id = props.id;
    this.lessonId = props.lessonId;
    this.title = props.title;
    this.description = props.description;
    this.timeLimitMinutes = props.timeLimitMinutes;
    this.passingScorePercentage = props.passingScorePercentage;
    this.randomizeQuestions = props.randomizeQuestions;
    this.randomizeOptions = props.randomizeOptions;
    this.maxAttempts = props.maxAttempts;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lessonTitle = props.lessonTitle;
    this.lessonType = props.lessonType;
    this.courseId = props.courseId;
    this.instructorId = props.instructorId;
  }

  /** API response-д буцаах формат */
  toResponse() {
    return {
      id: this.id,
      lessonId: this.lessonId,
      title: this.title,
      description: this.description,
      timeLimitMinutes: this.timeLimitMinutes,
      passingScorePercentage: this.passingScorePercentage,
      randomizeQuestions: this.randomizeQuestions,
      randomizeOptions: this.randomizeOptions,
      maxAttempts: this.maxAttempts,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lessonTitle: this.lessonTitle,
      courseId: this.courseId,
    };
  }
}
