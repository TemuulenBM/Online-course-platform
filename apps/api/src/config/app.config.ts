import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Render: PORT env автоматаар тавигдана (10000), local: APP_PORT эсвэл 3001
  port: parseInt(process.env.PORT || process.env.APP_PORT || '3001', 10),
  url: process.env.APP_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  nodeEnv: process.env.NODE_ENV || 'development',
}));
