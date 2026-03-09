import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  /** Connection pool-ийн хамгийн их холболтын тоо (production-д 20+ зөвлөмжтэй) */
  connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '20', 10),
  /** Connection pool-д сул холболт хүлээх хугацаа секундээр (default: 10) */
  poolTimeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10', 10),
}));
