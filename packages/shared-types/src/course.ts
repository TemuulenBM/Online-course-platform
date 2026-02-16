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
  tags?: string[];
  instructorName?: string;
  categoryName?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  coursesCount?: number;
}
