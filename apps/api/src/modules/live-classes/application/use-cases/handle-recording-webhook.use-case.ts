import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { LiveSessionRepository } from '../../infrastructure/repositories/live-session.repository';
import { RecordingWebhookDto } from '../../dto/recording-webhook.dto';
import * as crypto from 'crypto';

/**
 * Бичлэгийн webhook callback боловсруулах use case.
 * Agora/Cloudflare-аас ирсэн webhook-ийг хүлээн авч recording-ready queue job нэмнэ.
 */
@Injectable()
export class HandleRecordingWebhookUseCase {
  private readonly logger = new Logger(HandleRecordingWebhookUseCase.name);

  constructor(
    private readonly liveSessionRepository: LiveSessionRepository,
    private readonly configService: ConfigService,
    @InjectQueue('live-classes') private readonly liveClassesQueue: Queue,
  ) {}

  async execute(dto: RecordingWebhookDto, signature?: string): Promise<void> {
    /** 1. Webhook signature шалгах — webhookSecret заавал тохируулагдсан байх ёстой */
    const webhookSecret = this.configService.get<string>('agora.webhookSecret');
    if (!webhookSecret) {
      throw new InternalServerErrorException(
        'AGORA_WEBHOOK_SECRET тохируулагдаагүй байна. Webhook endpoint ажиллахгүй.',
      );
    }
    if (!signature) {
      throw new BadRequestException('Webhook signature толгой байхгүй байна (x-agora-signature)');
    }
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(dto))
      .digest('hex');
    const sigBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      throw new BadRequestException('Webhook signature буруу байна');
    }

    /** 2. Channel нэрээс session олох */
    const sessionId = dto.channelName.replace('ocp-live-', '');
    const session = await this.liveSessionRepository.findById(sessionId);

    if (!session) {
      this.logger.warn(`Webhook: session олдсонгүй channelName=${dto.channelName}`);
      return;
    }

    /** 3. Recording-ready queue job */
    await this.liveClassesQueue.add('recording-ready', {
      sessionId: session.id,
      recordingUrl: dto.recordingUrl,
    });

    this.logger.log(`Recording webhook хүлээн авлаа: session=${session.id}`);
  }
}
