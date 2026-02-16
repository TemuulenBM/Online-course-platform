import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  apiKey: process.env.SENDGRID_API_KEY,
  from: process.env.EMAIL_FROM || 'noreply@example.com',
}));
