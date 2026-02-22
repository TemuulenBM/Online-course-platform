import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AgoraTokenService } from '../../infrastructure/services/agora-token.service';

/** agora-token package-ийг mock хийх */
jest.mock('agora-token', () => ({
  RtcTokenBuilder: {
    buildTokenWithUid: jest.fn().mockReturnValue('mocked-agora-rtc-token'),
  },
  RtcRole: {
    PUBLISHER: 1,
    SUBSCRIBER: 2,
  },
}));

describe('AgoraTokenService', () => {
  let service: AgoraTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgoraTokenService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const map: Record<string, any> = {
                'agora.appId': 'test-app-id',
                'agora.appCertificate': 'test-cert',
                'agora.tokenExpirySeconds': 3600,
              };
              return map[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AgoraTokenService);
  });

  it('RTC token үүсгэнэ', () => {
    const token = service.generateRtcToken('channel-1', 12345, 'publisher');
    expect(token).toBe('mocked-agora-rtc-token');
  });

  it('subscriber role-аар token үүсгэнэ', () => {
    const token = service.generateRtcToken('channel-1', 12345, 'subscriber');
    expect(token).toBe('mocked-agora-rtc-token');
  });

  it('channel name зөв формат', () => {
    const name = service.generateChannelName('session-123');
    expect(name).toBe('ocp-live-session-123');
  });

  it('custom expiry дамжуулж болно', () => {
    const token = service.generateRtcToken('channel-1', 12345, 'publisher', 7200);
    expect(token).toBe('mocked-agora-rtc-token');
  });
});
