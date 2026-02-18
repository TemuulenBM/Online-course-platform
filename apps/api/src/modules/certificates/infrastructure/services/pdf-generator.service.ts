import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer-core';

/**
 * PDF үүсгэх сервис.
 * Puppeteer + HTML template ашиглан сертификатын PDF үүсгэнэ.
 */
@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private readonly chromiumPath: string;

  constructor(private readonly configService: ConfigService) {
    this.chromiumPath =
      this.configService.get<string>('CHROMIUM_PATH') || '/usr/bin/chromium-browser';
  }

  /** Сертификатын PDF buffer үүсгэнэ */
  async generateCertificatePdf(data: {
    userName: string;
    courseTitle: string;
    certificateNumber: string;
    issuedAt: Date;
    qrCodeDataUrl: string;
  }): Promise<Buffer> {
    const html = this.buildHtmlTemplate(data);

    const browser = await puppeteer.launch({
      executablePath: this.chromiumPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      this.logger.debug(`PDF үүсгэгдлээ: ${data.certificateNumber} (${pdfBuffer.length} bytes)`);
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /** HTML template бүтээнэ */
  private buildHtmlTemplate(data: {
    userName: string;
    courseTitle: string;
    certificateNumber: string;
    issuedAt: Date;
    qrCodeDataUrl: string;
  }): string {
    const issuedDate = data.issuedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 297mm;
      height: 210mm;
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .certificate {
      width: 277mm;
      height: 190mm;
      border: 3px solid #1a365d;
      padding: 30px 50px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      border: 1px solid #2b6cb0;
    }
    .header {
      color: #1a365d;
      font-size: 14px;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .title {
      color: #1a365d;
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .subtitle {
      color: #4a5568;
      font-size: 16px;
      margin-bottom: 15px;
    }
    .name {
      color: #1a365d;
      font-size: 32px;
      font-weight: bold;
      border-bottom: 2px solid #2b6cb0;
      padding-bottom: 8px;
      margin-bottom: 20px;
      display: inline-block;
    }
    .course-label {
      color: #4a5568;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .course-name {
      color: #2b6cb0;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 30px;
    }
    .details {
      color: #718096;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .qr-container {
      position: absolute;
      bottom: 25px;
      right: 60px;
    }
    .qr-container img {
      width: 80px;
      height: 80px;
    }
    .qr-label {
      font-size: 8px;
      color: #a0aec0;
      text-align: center;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">Online Course Platform</div>
    <div class="title">Certificate of Completion</div>
    <div class="subtitle">This is to certify that</div>
    <div class="name">${this.escapeHtml(data.userName)}</div>
    <div class="course-label">has successfully completed the course</div>
    <div class="course-name">${this.escapeHtml(data.courseTitle)}</div>
    <div class="details">Issued on ${issuedDate}</div>
    <div class="details">Certificate No: ${this.escapeHtml(data.certificateNumber)}</div>
    <div class="qr-container">
      <img src="${data.qrCodeDataUrl}" alt="QR Code" />
      <div class="qr-label">Scan to verify</div>
    </div>
  </div>
</body>
</html>`;
  }

  /** HTML тусгай тэмдэгтүүдийг escape хийнэ */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
