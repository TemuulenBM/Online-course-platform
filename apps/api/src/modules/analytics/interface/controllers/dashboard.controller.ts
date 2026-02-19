import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { GetOverviewUseCase } from '../../application/use-cases/get-overview.use-case';
import { GetRevenueReportUseCase } from '../../application/use-cases/get-revenue-report.use-case';
import { GetEnrollmentTrendUseCase } from '../../application/use-cases/get-enrollment-trend.use-case';
import { GetPopularCoursesUseCase } from '../../application/use-cases/get-popular-courses.use-case';
import { DateRangeQueryDto } from '../../dto/date-range-query.dto';

/**
 * Dashboard controller.
 * ADMIN-д зориулсан ерөнхий тоон үзүүлэлтүүд, тайлан, трэнд.
 */
@ApiTags('Аналитик — Dashboard')
@Controller('analytics/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly getOverviewUseCase: GetOverviewUseCase,
    private readonly getRevenueReportUseCase: GetRevenueReportUseCase,
    private readonly getEnrollmentTrendUseCase: GetEnrollmentTrendUseCase,
    private readonly getPopularCoursesUseCase: GetPopularCoursesUseCase,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Ерөнхий тоон үзүүлэлтүүд' })
  @ApiResponse({ status: 200, description: 'Dashboard overview' })
  async getOverview() {
    return this.getOverviewUseCase.execute();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Орлогын тайлан' })
  @ApiResponse({ status: 200, description: 'Хугацааны бүлэглэлтэй орлогын тайлан' })
  async getRevenueReport(@Query() query: DateRangeQueryDto) {
    return this.getRevenueReportUseCase.execute({
      period: query.period ?? 'month',
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Элсэлтийн трэнд' })
  @ApiResponse({
    status: 200,
    description: 'Хугацааны бүлэглэлтэй элсэлтийн трэнд',
  })
  async getEnrollmentTrend(@Query() query: DateRangeQueryDto) {
    return this.getEnrollmentTrendUseCase.execute({
      period: query.period ?? 'month',
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  @Get('popular-courses')
  @ApiOperation({ summary: 'Топ сургалтууд' })
  @ApiResponse({
    status: 200,
    description: 'Элсэлт, дуусгалт, орлогоор эрэмбэлсэн сургалтууд',
  })
  async getPopularCourses(@Query('limit') limit?: number) {
    return this.getPopularCoursesUseCase.execute(limit ?? 10);
  }
}
