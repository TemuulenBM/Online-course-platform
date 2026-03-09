import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  uri: process.env.MONGODB_URI,
  /** MongoDB connection pool-ийн хамгийн их холболтын тоо (production-д 20+ зөвлөмжтэй) */
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '20', 10),
}));
