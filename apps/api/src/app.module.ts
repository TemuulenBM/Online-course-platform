import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
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

// Common modules
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';

import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { ContentModule } from './modules/content/content.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
// import { ProgressModule } from './modules/progress/progress.module';
// import { QuizzesModule } from './modules/quizzes/quizzes.module';
// import { CertificatesModule } from './modules/certificates/certificates.module';
// import { DiscussionsModule } from './modules/discussions/discussions.module';
// import { NotificationsModule } from './modules/notifications/notifications.module';
// import { PaymentsModule } from './modules/payments/payments.module';
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { AdminModule } from './modules/admin/admin.module';
// import { LiveClassesModule } from './modules/live-classes/live-classes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, mongodbConfig, redisConfig, jwtConfig, throttleConfig, storageConfig],
    }),
    // Rate limiting — хүсэлт хязгаарлалт (config-оос уншина)
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([
        { name: 'short', ttl: config.get<number>('throttle.short.ttl')!, limit: config.get<number>('throttle.short.limit')! },
        { name: 'medium', ttl: config.get<number>('throttle.medium.ttl')!, limit: config.get<number>('throttle.medium.limit')! },
        { name: 'long', ttl: config.get<number>('throttle.long.ttl')!, limit: config.get<number>('throttle.long.limit')! },
      ]),
    }),
    // MongoDB холболт — Content модулиас эхлэн ашиглана
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri'),
      }),
    }),
    PrismaModule,
    RedisModule,
    UsersModule,
    AuthModule,
    CoursesModule,
    LessonsModule,
    ContentModule,
    EnrollmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ThrottlerGuard бүх endpoint-д автомат ажиллана
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
