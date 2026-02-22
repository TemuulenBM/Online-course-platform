import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SystemSettingEntity } from '../../domain/entities/system-setting.entity';

/**
 * Системийн тохиргоо repository.
 * SYSTEM_SETTINGS таблицын CRUD үйлдлүүд.
 */
@Injectable()
export class SystemSettingRepository {
  private readonly logger = new Logger(SystemSettingRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Бүх тохиргоо авах (category filter) */
  async findAll(category?: string): Promise<SystemSettingEntity[]> {
    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }

    const settings = await this.prisma.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    return settings.map((s) => this.toEntity(s));
  }

  /** Key-аар тохиргоо олох */
  async findByKey(key: string): Promise<SystemSettingEntity | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });

    return setting ? this.toEntity(setting) : null;
  }

  /** Public тохиргоонууд */
  async findPublic(): Promise<SystemSettingEntity[]> {
    const settings = await this.prisma.systemSetting.findMany({
      where: { isPublic: true },
      orderBy: { key: 'asc' },
    });

    return settings.map((s) => this.toEntity(s));
  }

  /** Тохиргоо upsert (үүсгэх/шинэчлэх) */
  async upsert(
    key: string,
    data: {
      value: unknown;
      description?: string;
      category?: string;
      isPublic?: boolean;
      updatedBy: string;
    },
  ): Promise<SystemSettingEntity> {
    const setting = await this.prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: data.value as Prisma.InputJsonValue,
        description: data.description,
        category: data.category ?? 'general',
        isPublic: data.isPublic ?? false,
        updatedBy: data.updatedBy,
      },
      update: {
        value: data.value as Prisma.InputJsonValue,
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        updatedBy: data.updatedBy,
      },
    });

    this.logger.debug(`Тохиргоо upsert хийгдлээ: ${key}`);
    return this.toEntity(setting);
  }

  /** Тохиргоо устгах */
  async delete(key: string): Promise<void> {
    await this.prisma.systemSetting.delete({ where: { key } });
    this.logger.debug(`Тохиргоо устгагдлаа: ${key}`);
  }

  /** Prisma object-ийг entity руу хөрвүүлэх */
  private toEntity(setting: {
    id: string;
    key: string;
    value: unknown;
    description: string | null;
    category: string;
    isPublic: boolean;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SystemSettingEntity {
    return new SystemSettingEntity({
      id: setting.id,
      key: setting.key,
      value: setting.value,
      description: setting.description,
      category: setting.category,
      isPublic: setting.isPublic,
      updatedBy: setting.updatedBy,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    });
  }
}
