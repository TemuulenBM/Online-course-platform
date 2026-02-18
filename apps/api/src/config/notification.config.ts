import { registerAs } from '@nestjs/config';

export default registerAs('notification', () => ({
  // Email — SendGrid
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  emailEnabled: process.env.NOTIFICATION_EMAIL_ENABLED !== 'false',

  // SMS — Twilio (Phase 5 placeholder)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER,
  smsEnabled: process.env.NOTIFICATION_SMS_ENABLED === 'true',

  // Push — Expo (Phase 7 placeholder)
  pushEnabled: process.env.NOTIFICATION_PUSH_ENABLED === 'true',

  // In-app — заавал идэвхтэй
  inAppEnabled: true,
}));
