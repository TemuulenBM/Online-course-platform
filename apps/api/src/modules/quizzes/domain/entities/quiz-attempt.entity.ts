/**
 * QuizAttempt domain entity.
 * PostgreSQL-ийн quiz_attempts хүснэгтийн бизнес логикийн төлөөлөл.
 */
export class QuizAttemptEntity {
  readonly id: string;
  readonly quizId: string;
  readonly userId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly startedAt: Date;
  readonly submittedAt: Date | null;
  readonly createdAt: Date;

  /** Quiz-ээс нэмэгдсэн мэдээлэл */
  readonly quizTitle?: string;
  readonly lessonId?: string;

  constructor(props: {
    id: string;
    quizId: string;
    userId: string;
    score: number;
    maxScore: number;
    passed: boolean;
    startedAt: Date;
    submittedAt: Date | null;
    createdAt: Date;
    quizTitle?: string;
    lessonId?: string;
  }) {
    this.id = props.id;
    this.quizId = props.quizId;
    this.userId = props.userId;
    this.score = props.score;
    this.maxScore = props.maxScore;
    this.passed = props.passed;
    this.startedAt = props.startedAt;
    this.submittedAt = props.submittedAt;
    this.createdAt = props.createdAt;
    this.quizTitle = props.quizTitle;
    this.lessonId = props.lessonId;
  }

  /** Дуусаагүй оролдлого эсэх */
  get isInProgress(): boolean {
    return this.submittedAt === null;
  }

  /** Оноон хувь (0-100) */
  get scorePercentage(): number {
    if (this.maxScore === 0) return 0;
    return Math.round((this.score / this.maxScore) * 100);
  }

  /** API response-д буцаах формат */
  toResponse() {
    return {
      id: this.id,
      quizId: this.quizId,
      userId: this.userId,
      score: this.score,
      maxScore: this.maxScore,
      passed: this.passed,
      scorePercentage: this.scorePercentage,
      startedAt: this.startedAt,
      submittedAt: this.submittedAt,
      createdAt: this.createdAt,
      quizTitle: this.quizTitle,
      lessonId: this.lessonId,
    };
  }
}
