import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { StaticFilesMiddleware } from './common/middleware/static-files.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Config imports
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import mongodbConfig from './config/mongodb.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import throttleConfig from './config/throttle.config';
import storageConfig from './config/storage.config';
import notificationConfig from './config/notification.config';
import stripeConfig from './config/stripe.config';
import agoraConfig from './config/agora.config';

// Common modules
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { StorageModule } from './common/storage/storage.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';

import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ContentModule } from './modules/content/content.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { ProgressModule } from './modules/progress/progress.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { DiscussionsModule } from './modules/discussions/discussions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { LiveClassesModule } from './modules/live-classes/live-classes.module';

@Module({
  imports: [
    // Sentry — алдаа бүртгэл, гүйцэтгэлийн хяналт (SENTRY_DSN тохируулагдсан үед идэвхждэг)
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        mongodbConfig,
        redisConfig,
        jwtConfig,
        throttleConfig,
        storageConfig,
        notificationConfig,
        stripeConfig,
        agoraConfig,
      ],
    }),
    // Rate limiting — хүсэлт хязгаарлалт (config-оос уншина)
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'short',
          ttl: config.get<number>('throttle.short.ttl')!,
          limit: config.get<number>('throttle.short.limit')!,
        },
        {
          name: 'medium',
          ttl: config.get<number>('throttle.medium.ttl')!,
          limit: config.get<number>('throttle.medium.limit')!,
        },
        {
          name: 'long',
          ttl: config.get<number>('throttle.long.ttl')!,
          limit: config.get<number>('throttle.long.limit')!,
        },
      ],
    }),
    // MongoDB холболт — Content модулиас эхлэн ашиглана
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri'),
      }),
    }),
    // Bull Queue — background job processing (REDIS_URL байвал URL-ээр, үгүй бол host/port-оор)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('redis.url');
        const baseConfig = redisUrl
          ? { url: redisUrl }
          : {
              redis: {
                host: config.get<string>('redis.host'),
                port: config.get<number>('redis.port'),
                password: config.get<string>('redis.password') || undefined,
                tls: config.get('redis.tls'),
              },
            };
        return {
          ...baseConfig,
          // Бүх queue-д хамаарах default тохиргоо
          // Job 3 удаа retry, exponential backoff (2s, 4s, 8s)
          // Амжилттай job-уудаас 100-г, failed job-уудаас 500-г хадгалж лог харах боломж олгоно
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 100,
            removeOnFail: 500,
            // Job-ийн хамгийн их ажиллах хугацаа — Puppeteer PDF зэрэг удаан job hang хийхээс хамгаалах
            timeout: 120000, // 2 минут
          },
        };
      },
    }),
    PrismaModule,
    RedisModule,
    // StorageModule — @Global(), STORAGE_SERVICE token-г бүх модулиас ашиглах боломжтой
    StorageModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    LessonsModule,
    ContentModule,
    EnrollmentsModule,
    ProgressModule,
    QuizzesModule,
    CertificatesModule,
    DiscussionsModule,
    NotificationsModule,
    PaymentsModule,
    AnalyticsModule,
    AdminModule,
    LiveClassesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Sentry global filter — бүх unhandled exception-г Sentry-д илгээнэ
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    // ThrottlerGuard бүх endpoint-д автомат ажиллана
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  // /uploads/ статик файлуудад extension whitelist + Content-Disposition middleware холбоно
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(StaticFilesMiddleware).forRoutes('/uploads/*');
  }
}
