import { IsString, IsOptional } from 'class-validator';

/** Бичлэгийн webhook callback DTO */
export class RecordingWebhookDto {
  /** Agora суваг нэр */
  @IsString()
  channelName!: string;

  /** Бичлэгийн URL */
  @IsString()
  recordingUrl!: string;

  /** Бичлэгийн статус */
  @IsOptional()
  @IsString()
  status?: string;
}
