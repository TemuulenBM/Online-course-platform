import { IsOptional, IsString } from 'class-validator';

/** Тохиргоо жагсаалтын query DTO */
export class ListSettingsQueryDto {
  @IsOptional()
  @IsString()
  category?: string;
}
