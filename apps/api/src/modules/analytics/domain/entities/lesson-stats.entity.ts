/**
 * Хичээлийн статистикийн value object.
 * Нэг хичээлийн дуусгалтын хувь, дундаж зарцуулсан хугацаа гэх мэт.
 */
export class LessonStatsItem {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly lessonType: string;
  readonly orderIndex: number;
  readonly totalStudents: number;
  readonly completedStudents: number;
  readonly completionRate: number;
  readonly avgTimeSpentSeconds: number;
  readonly avgProgress: number;

  constructor(props: {
    lessonId: string;
    lessonTitle: string;
    lessonType: string;
    orderIndex: number;
    totalStudents: number;
    completedStudents: number;
    completionRate: number;
    avgTimeSpentSeconds: number;
    avgProgress: number;
  }) {
    this.lessonId = props.lessonId;
    this.lessonTitle = props.lessonTitle;
    this.lessonType = props.lessonType;
    this.orderIndex = Number(props.orderIndex) || 0;
    this.totalStudents = Number(props.totalStudents) || 0;
    this.completedStudents = Number(props.completedStudents) || 0;
    this.completionRate = Number(props.completionRate) || 0;
    this.avgTimeSpentSeconds = Number(props.avgTimeSpentSeconds) || 0;
    this.avgProgress = Number(props.avgProgress) || 0;
  }

  toResponse() {
    return {
      lessonId: this.lessonId,
      lessonTitle: this.lessonTitle,
      lessonType: this.lessonType,
      orderIndex: this.orderIndex,
      totalStudents: this.totalStudents,
      completedStudents: this.completedStudents,
      completionRate: this.completionRate,
      avgTimeSpentSeconds: this.avgTimeSpentSeconds,
      avgProgress: this.avgProgress,
    };
  }
}
