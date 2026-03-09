import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Prisma сервис — мэдээллийн сантай холбогдох үндсэн сервис.
 * Prisma 7-д @prisma/adapter-pg driver adapter ашиглана.
 * Аппликейшн эхлэх үед холбогдож, зогсох үед салгана.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10', 10);
    const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '10', 10);
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: connectionLimit,
      idleTimeoutMillis: poolTimeout * 1000,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('PostgreSQL мэдээллийн сантай амжилттай холбогдлоо');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('PostgreSQL мэдээллийн сангийн холболт салгагдлаа');
  }
}
