import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
