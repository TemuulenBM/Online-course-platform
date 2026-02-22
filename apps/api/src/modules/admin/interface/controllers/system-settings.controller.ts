import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ListSettingsUseCase } from '../../application/use-cases/list-settings.use-case';
import { GetSettingUseCase } from '../../application/use-cases/get-setting.use-case';
import { UpsertSettingUseCase } from '../../application/use-cases/upsert-setting.use-case';
import { DeleteSettingUseCase } from '../../application/use-cases/delete-setting.use-case';
import { UpsertSettingDto } from '../../dto/upsert-setting.dto';
import { ListSettingsQueryDto } from '../../dto/list-settings-query.dto';

/**
 * Системийн тохиргоо controller.
 * Платформын key-value тохиргоо удирдах.
 */
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SystemSettingsController {
  constructor(
    private readonly listSettingsUseCase: ListSettingsUseCase,
    private readonly getSettingUseCase: GetSettingUseCase,
    private readonly upsertSettingUseCase: UpsertSettingUseCase,
    private readonly deleteSettingUseCase: DeleteSettingUseCase,
  ) {}

  /** Бүх тохиргоо жагсаалт (category filter) */
  @Get()
  async list(@Query() query: ListSettingsQueryDto) {
    return this.listSettingsUseCase.execute({ category: query.category });
  }

  /** Public тохиргоо (JWT шаардлагагүй) */
  @Get('public')
  @Public()
  async listPublic() {
    return this.listSettingsUseCase.execute({ publicOnly: true });
  }

  /** Key-аар нэг тохиргоо */
  @Get(':key')
  async getByKey(@Param('key') key: string) {
    return this.getSettingUseCase.execute(key);
  }

  /** Тохиргоо upsert (үүсгэх/шинэчлэх) */
  @Put(':key')
  async upsert(
    @Param('key') key: string,
    @Body() body: UpsertSettingDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.upsertSettingUseCase.execute(key, body, userId);
  }

  /** Тохиргоо устгах */
  @Delete(':key')
  async delete(@Param('key') key: string, @CurrentUser('id') userId: string) {
    await this.deleteSettingUseCase.execute(key, userId);
    return { message: 'Тохиргоо амжилттай устгагдлаа' };
  }
}
