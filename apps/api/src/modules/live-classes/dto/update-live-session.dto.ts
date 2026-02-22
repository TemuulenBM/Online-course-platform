import { IsString, IsOptional, IsDateString } from 'class-validator';

/** Live session шинэчлэх DTO */
export class UpdateLiveSessionDto {
  /** Session-ийн гарчиг */
  @IsOptional()
  @IsString()
  title?: string;

  /** Тайлбар */
  @IsOptional()
  @IsString()
  description?: string;

  /** Эхлэх цаг (ISO 8601) */
  @IsOptional()
  @IsDateString()
  scheduledStart?: string;

  /** Дуусах цаг (ISO 8601) */
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;
}
