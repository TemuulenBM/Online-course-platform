export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructorId: string;
  categoryId: string;
  price?: number;
  discountPrice?: number;
  difficulty: CourseDifficulty;
  language: string;
  status: CourseStatus;
  thumbnailUrl?: string;
  durationMinutes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
