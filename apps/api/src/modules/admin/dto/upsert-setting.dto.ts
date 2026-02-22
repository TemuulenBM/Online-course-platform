import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

/** Системийн тохиргоо upsert DTO */
export class UpsertSettingDto {
  @IsNotEmpty({ message: 'Утга заавал шаардлагатай' })
  value: unknown;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
