import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

// Controllers
import { DashboardController } from './interface/controllers/dashboard.controller';
import { CourseAnalyticsController } from './interface/controllers/course-analytics.controller';
import { EventsController } from './interface/controllers/events.controller';

// Use Cases
import { TrackEventUseCase } from './application/use-cases/track-event.use-case';
import { ListEventsUseCase } from './application/use-cases/list-events.use-case';
import { GetOverviewUseCase } from './application/use-cases/get-overview.use-case';
import { GetRevenueReportUseCase } from './application/use-cases/get-revenue-report.use-case';
import { GetEnrollmentTrendUseCase } from './application/use-cases/get-enrollment-trend.use-case';
import { GetPopularCoursesUseCase } from './application/use-cases/get-popular-courses.use-case';
import { GetCourseStatsUseCase } from './application/use-cases/get-course-stats.use-case';
import { GetCourseStudentsUseCase } from './application/use-cases/get-course-students.use-case';
import { GetCourseLessonsUseCase } from './application/use-cases/get-course-lessons.use-case';

// Infrastructure
import { AnalyticsEventRepository } from './infrastructure/repositories/analytics-event.repository';
import { AnalyticsAggregationRepository } from './infrastructure/repositories/analytics-aggregation.repository';
import { AnalyticsCacheService } from './infrastructure/services/analytics-cache.service';
import { AnalyticsProcessor } from './infrastructure/services/analytics.processor';

/**
 * Analytics модуль.
 * Dashboard тоон үзүүлэлтүүд, орлогын тайлан, элсэлтийн трэнд,
 * сургалтын статистик, event tracking хангана.
 * Bull Queue-ээр event-ууд async бүртгэгдэнэ, Redis-ээр dashboard кэшлэнэ.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: 'analytics' }),
    ConfigModule,
    CoursesModule,
    EnrollmentsModule,
  ],
  controllers: [DashboardController, CourseAnalyticsController, EventsController],
  providers: [
    // Use Cases
    TrackEventUseCase,
    ListEventsUseCase,
    GetOverviewUseCase,
    GetRevenueReportUseCase,
    GetEnrollmentTrendUseCase,
    GetPopularCoursesUseCase,
    GetCourseStatsUseCase,
    GetCourseStudentsUseCase,
    GetCourseLessonsUseCase,
    // Infrastructure
    AnalyticsEventRepository,
    AnalyticsAggregationRepository,
    AnalyticsCacheService,
    AnalyticsProcessor,
  ],
  exports: [AnalyticsEventRepository],
})
export class AnalyticsModule {}
