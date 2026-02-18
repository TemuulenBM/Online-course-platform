import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

/** Email илгээх service-ийн interface */
export interface IEmailService {
  sendEmail(to: string, subject: string, htmlContent: string): Promise<void>;
}

/** DI token — email service inject хийхэд ашиглагдана */
export const EMAIL_SERVICE = 'EMAIL_SERVICE';

/**
 * SendGrid ашиглан email илгээх service.
 * notification.config.ts-ийн тохиргоог ашиглана.
 */
@Injectable()
export class SendGridEmailService implements IEmailService {
  private readonly logger = new Logger(SendGridEmailService.name);
  private readonly fromEmail: string;
  private initialized = false;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('notification.sendgridApiKey');
    this.fromEmail =
      this.configService.get<string>('notification.emailFrom') || 'noreply@example.com';

    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.initialized = true;
      this.logger.log('SendGrid email service амжилттай тохируулагдлаа');
    } else {
      this.logger.warn('SENDGRID_API_KEY тохируулаагүй — email илгээгдэхгүй');
    }
  }

  /** Email илгээх */
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    if (!this.initialized) {
      this.logger.warn(`Email илгээх боломжгүй (API key байхгүй): ${to}`);
      return;
    }

    try {
      await sgMail.send({
        to,
        from: this.fromEmail,
        subject,
        html: htmlContent,
      });
      this.logger.log(`Email амжилттай илгээгдлээ: ${to}`);
    } catch (error: any) {
      this.logger.error(`Email илгээхэд алдаа гарлаа: ${to} — ${error.message}`, error.stack);
    }
  }
}
