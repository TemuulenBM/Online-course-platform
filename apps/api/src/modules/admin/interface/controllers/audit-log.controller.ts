import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ListAuditLogsUseCase } from '../../application/use-cases/list-audit-logs.use-case';
import { GetAuditLogUseCase } from '../../application/use-cases/get-audit-log.use-case';
import { GetEntityAuditTrailUseCase } from '../../application/use-cases/get-entity-audit-trail.use-case';
import { ListAuditLogsQueryDto } from '../../dto/list-audit-logs-query.dto';
import { EntityAuditTrailQueryDto } from '../../dto/entity-audit-trail-query.dto';

/**
 * Audit log controller.
 * Админ үйлдлүүдийн бүртгэлийг жагсаалтаар авах.
 */
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AuditLogController {
  constructor(
    private readonly listAuditLogsUseCase: ListAuditLogsUseCase,
    private readonly getAuditLogUseCase: GetAuditLogUseCase,
    private readonly getEntityAuditTrailUseCase: GetEntityAuditTrailUseCase,
  ) {}

  /** Audit log жагсаалт (pagination + filters) */
  @Get()
  async list(@Query() query: ListAuditLogsQueryDto) {
    return this.listAuditLogsUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      userId: query.userId,
      entityType: query.entityType,
      action: query.action,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  /** Entity-ийн audit trail */
  @Get('entity/:entityType/:entityId')
  async getEntityTrail(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() query: EntityAuditTrailQueryDto,
  ) {
    return this.getEntityAuditTrailUseCase.execute(entityType, entityId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  /** Нэг audit log дэлгэрэнгүй */
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getAuditLogUseCase.execute(id);
  }
}
