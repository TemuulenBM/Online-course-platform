import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer-core';

/**
 * Нэхэмжлэхийн PDF үүсгэх сервис.
 * Puppeteer + HTML template ашиглан A4 portrait PDF үүсгэнэ.
 * Certificates модулийн PdfGeneratorService pattern-ийг дагана.
 */
@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  constructor(private readonly configService: ConfigService) {}

  /** Нэхэмжлэхийн PDF buffer үүсгэнэ */
  async generateInvoicePdf(data: {
    invoiceNumber: string;
    amount: number;
    currency: string;
    courseTitle: string;
    userName: string;
    userEmail: string;
    createdAt: Date;
  }): Promise<Buffer> {
    const chromiumPath =
      this.configService.get<string>('CHROMIUM_PATH') || '/usr/bin/chromium-browser';

    const formattedDate = data.createdAt.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedAmount = new Intl.NumberFormat('mn-MN').format(data.amount);

    const html = this.buildInvoiceHtml({
      ...data,
      formattedDate,
      formattedAmount,
    });

    let browser;
    try {
      browser = await puppeteer.launch({
        executablePath: chromiumPath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`PDF үүсгэхэд алдаа: ${error}`);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  /** Invoice HTML template */
  private buildInvoiceHtml(data: {
    invoiceNumber: string;
    amount: number;
    currency: string;
    courseTitle: string;
    userName: string;
    userEmail: string;
    formattedDate: string;
    formattedAmount: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .company { font-size: 24px; font-weight: bold; color: #2563eb; }
    .invoice-title { font-size: 28px; color: #666; text-align: right; }
    .invoice-number { font-size: 14px; color: #888; text-align: right; margin-top: 4px; }
    .divider { border-top: 2px solid #e5e7eb; margin: 24px 0; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .info-block h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
    .info-block p { font-size: 14px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #e5e7eb; }
    td { padding: 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .text-right { text-align: right; }
    .total-row { background: #f0f9ff; }
    .total-row td { font-weight: bold; font-size: 16px; color: #2563eb; }
    .footer { margin-top: 48px; text-align: center; color: #9ca3af; font-size: 12px; }
    .status { display: inline-block; background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">Online Course Platform</div>
      <p style="color: #888; font-size: 12px; margin-top: 4px;">Онлайн Сургалтын Платформ</p>
    </div>
    <div>
      <div class="invoice-title">НЭХЭМЖЛЭХ</div>
      <div class="invoice-number">${data.invoiceNumber}</div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="info-section">
    <div class="info-block">
      <h3>Хэрэглэгч</h3>
      <p>${data.userName}</p>
      <p>${data.userEmail}</p>
    </div>
    <div class="info-block" style="text-align: right;">
      <h3>Огноо</h3>
      <p>${data.formattedDate}</p>
      <p><span class="status">ТӨЛӨГДСӨН</span></p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Бүтээгдэхүүн</th>
        <th>Тоо</th>
        <th class="text-right">Нийт дүн</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${data.courseTitle}</td>
        <td>1</td>
        <td class="text-right">${data.formattedAmount} ${data.currency}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2">Нийт</td>
        <td class="text-right">${data.formattedAmount} ${data.currency}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Энэ нэхэмжлэх автоматаар үүсгэгдсэн болно.</p>
    <p>Online Course Platform &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;
  }
}
