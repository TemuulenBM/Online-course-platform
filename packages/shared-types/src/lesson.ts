export type LessonType = 'video' | 'text' | 'quiz' | 'assignment' | 'live';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessonType: LessonType;
  durationMinutes: number;
  isPreview: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
