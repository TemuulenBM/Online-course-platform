import { IsUUID, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

/** Live session үүсгэх DTO */
export class CreateLiveSessionDto {
  /** Хичээлийн ID (lessonType=LIVE байх ёстой, эсвэл courseId-тай хамт орхиж болно) */
  @IsOptional()
  @IsUUID('4')
  lessonId?: string;

  /** Сургалтын ID (lessonId байхгүй үед автоматаар LIVE хичээл үүсгэхэд ашиглана) */
  @IsOptional()
  @IsUUID('4')
  courseId?: string;

  /** Session-ийн гарчиг */
  @IsString()
  @IsNotEmpty()
  title!: string;

  /** Тайлбар */
  @IsOptional()
  @IsString()
  description?: string;

  /** Эхлэх цаг (ISO 8601) */
  @IsDateString()
  scheduledStart!: string;

  /** Дуусах цаг (ISO 8601) */
  @IsDateString()
  scheduledEnd!: string;
}
