import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Config imports
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import mongodbConfig from './config/mongodb.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';

// Module imports will be added as modules are implemented
// import { AuthModule } from './modules/auth/auth.module';
// import { UsersModule } from './modules/users/users.module';
// import { CoursesModule } from './modules/courses/courses.module';
// import { LessonsModule } from './modules/lessons/lessons.module';
// import { ContentModule } from './modules/content/content.module';
// import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
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
      load: [appConfig, databaseConfig, mongodbConfig, redisConfig, jwtConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
