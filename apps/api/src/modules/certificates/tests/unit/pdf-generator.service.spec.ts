/** Mock puppeteer-core модулийг тест эхлэхээс өмнө бэлдэнэ */
const mockPage = {
  setContent: jest.fn().mockResolvedValue(undefined),
  pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf')),
};
const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined),
};
jest.mock('puppeteer-core', () => ({
  __esModule: true,
  default: { launch: jest.fn().mockResolvedValue(mockBrowser) },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PdfGeneratorService } from '../../infrastructure/services/pdf-generator.service';

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;
  let configService: jest.Mocked<ConfigService>;

  /** PDF үүсгэхэд ашиглах mock өгөгдөл */
  const mockPdfData = {
    userName: 'John Doe',
    courseTitle: 'Test Course',
    certificateNumber: 'OCP-2026-ABCD1234',
    issuedAt: new Date('2026-01-01'),
    qrCodeDataUrl: 'data:image/png;base64,fakeQrCode',
  };

  beforeEach(async () => {
    /** Mock-уудыг reset хийнэ */
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfGeneratorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('/usr/bin/chromium-browser'),
          },
        },
      ],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);
    configService = module.get(ConfigService);
  });

  it('generateCertificatePdf — Buffer буцаах ёстой', async () => {
    const result = await service.generateCertificatePdf(mockPdfData);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toBe('fake-pdf');
    expect(mockBrowser.newPage).toHaveBeenCalled();
    expect(mockPage.setContent).toHaveBeenCalled();
    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'A4',
        landscape: true,
        printBackground: true,
      }),
    );
  });

  it('generateCertificatePdf — browser.close() заавал дуудагдах (finally блок)', async () => {
    await service.generateCertificatePdf(mockPdfData);

    expect(mockBrowser.close).toHaveBeenCalled();
  });
});
