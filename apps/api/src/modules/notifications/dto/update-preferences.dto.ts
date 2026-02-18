import { IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Мэдэгдлийн тохиргоо шинэчлэх DTO.
 */
export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Email мэдэгдэл идэвхтэй эсэх',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'emailEnabled boolean байх ёстой' })
  emailEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Push мэдэгдэл идэвхтэй эсэх',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'pushEnabled boolean байх ёстой' })
  pushEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'SMS мэдэгдэл идэвхтэй эсэх',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'smsEnabled boolean байх ёстой' })
  smsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Мэдэгдлийн төрөл тус бүрийн channel тохиргоо (JSON)',
    example: {
      enrollment_confirmation: { email: true, push: true, sms: false },
      course_completion: { email: true, push: true, sms: false },
    },
  })
  @IsOptional()
  @IsObject({ message: 'channelPreferences объект байх ёстой' })
  channelPreferences?: Record<string, unknown>;
}
