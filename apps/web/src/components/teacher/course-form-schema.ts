import { z } from 'zod';

/** Сургалт үүсгэх/засах формын Zod schema */
export const courseFormSchema = z.object({
  title: z.string().min(1, 'Гарчиг оруулна уу'),
  description: z.string().min(1, 'Тайлбар оруулна уу'),
  categoryId: z.string().min(1, 'Ангилал сонгоно уу'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.coerce.number().min(0).optional(),
  discountPrice: z.coerce.number().min(0).optional(),
  language: z.string().optional(),
  tags: z.string().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
