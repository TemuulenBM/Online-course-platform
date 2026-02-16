import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  categoryId: z.string().uuid(),
  price: z.number().min(0).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().default('en'),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
