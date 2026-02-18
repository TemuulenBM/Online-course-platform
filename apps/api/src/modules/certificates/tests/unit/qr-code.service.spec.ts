/** Mock qrcode модулийг тест эхлэхээс өмнө бэлдэнэ */
jest.mock('qrcode', () => ({
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-qr-png')),
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,fakeBase64QrCode'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import * as QRCode from 'qrcode';
import { QrCodeService } from '../../infrastructure/services/qr-code.service';

describe('QrCodeService', () => {
  let service: QrCodeService;

  /** Тестэд ашиглах mock URL */
  const testUrl = 'http://localhost:3001/api/v1/certificates/verify/abc123';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [QrCodeService],
    }).compile();

    service = module.get<QrCodeService>(QrCodeService);
  });

  it('generateQrCodeBuffer — toBuffer дуудагдаж Buffer буцаах', async () => {
    const result = await service.generateQrCodeBuffer(testUrl);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toBe('fake-qr-png');
    expect(QRCode.toBuffer).toHaveBeenCalledWith(
      testUrl,
      expect.objectContaining({
        type: 'png',
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      }),
    );
  });

  it('generateQrCodeDataUrl — toDataURL дуудагдаж string буцаах', async () => {
    const result = await service.generateQrCodeDataUrl(testUrl);

    expect(typeof result).toBe('string');
    expect(result).toBe('data:image/png;base64,fakeBase64QrCode');
    expect(QRCode.toDataURL).toHaveBeenCalledWith(
      testUrl,
      expect.objectContaining({
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      }),
    );
  });
});
