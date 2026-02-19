import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Event бүртгэх DTO */
export class TrackEventDto {
  @ApiProperty({ description: 'Event-ийн нэр (page_view, video_play гэх мэт)' })
  @IsString()
  eventName!: string;

  @ApiProperty({
    description: 'Event-ийн ангилал (user_auth, learning, payment гэх мэт)',
  })
  @IsString()
  eventCategory!: string;

  @ApiPropertyOptional({ description: 'Нэмэлт мэдээлэл (JSON object)' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Session ID (client-ээс)' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
