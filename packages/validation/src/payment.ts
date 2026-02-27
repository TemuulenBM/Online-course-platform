import { z } from 'zod';

/** Захиалга үүсгэх schema */
export const createOrderSchema = z.object({
  courseId: z.string().uuid(),
  paymentMethod: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** Захиалгын жагсаалтын шүүлтүүр */
export const listOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});

export type ListOrdersInput = z.infer<typeof listOrdersSchema>;

/** Нэхэмжлэхийн жагсаалтын шүүлтүүр */
export const listInvoicesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>;
