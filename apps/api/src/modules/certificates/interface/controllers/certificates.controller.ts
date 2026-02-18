import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { GenerateCertificateUseCase } from '../../application/use-cases/generate-certificate.use-case';
import { ListMyCertificatesUseCase } from '../../application/use-cases/list-my-certificates.use-case';
import { ListCourseCertificatesUseCase } from '../../application/use-cases/list-course-certificates.use-case';
import { GetCertificateUseCase } from '../../application/use-cases/get-certificate.use-case';
import { VerifyCertificateUseCase } from '../../application/use-cases/verify-certificate.use-case';
import { DeleteCertificateUseCase } from '../../application/use-cases/delete-certificate.use-case';
import { ListCertificatesQueryDto } from '../../dto/list-certificates-query.dto';

/**
 * Сертификатын controller.
 * Сертификат үүсгэх, жагсаалт, баталгаажуулалт, устгах endpoint-ууд.
 */
@ApiTags('Сертификат')
@Controller('certificates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CertificatesController {
  constructor(
    private readonly generateCertificateUseCase: GenerateCertificateUseCase,
    private readonly listMyCertificatesUseCase: ListMyCertificatesUseCase,
    private readonly listCourseCertificatesUseCase: ListCourseCertificatesUseCase,
    private readonly getCertificateUseCase: GetCertificateUseCase,
    private readonly verifyCertificateUseCase: VerifyCertificateUseCase,
    private readonly deleteCertificateUseCase: DeleteCertificateUseCase,
  ) {}

  /** Сертификат баталгаажуулах — @Public, JWT шаардлагагүй */
  @Get('verify/:verificationCode')
  @Public()
  @ApiOperation({ summary: 'Сертификат баталгаажуулах (нийтийн)' })
  @ApiResponse({ status: 200, description: 'Сертификатын мэдээлэл' })
  @ApiResponse({ status: 404, description: 'Сертификат олдсонгүй' })
  async verifyCertificate(@Param('verificationCode') verificationCode: string) {
    const certificate = await this.verifyCertificateUseCase.execute(verificationCode);
    return certificate.toResponse();
  }

  /** Миний сертификатуудын жагсаалт */
  @Get('my')
  @ApiOperation({ summary: 'Миний сертификатууд' })
  @ApiResponse({ status: 200, description: 'Сертификатуудын жагсаалт' })
  async listMyCertificates(
    @CurrentUser('id') userId: string,
    @Query() query: ListCertificatesQueryDto,
  ) {
    const result = await this.listMyCertificatesUseCase.execute(userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      data: result.data.map((c) => c.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /** Сургалтын сертификатуудын жагсаалт */
  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Сургалтын сертификатууд (TEACHER/ADMIN)' })
  @ApiResponse({ status: 200, description: 'Сертификатуудын жагсаалт' })
  @ApiResponse({ status: 403, description: 'Эрхгүй' })
  async listCourseCertificates(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query() query: ListCertificatesQueryDto,
  ) {
    const result = await this.listCourseCertificatesUseCase.execute(userId, userRole, courseId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
    return {
      data: result.data.map((c) => c.toResponse()),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /** Сертификат үүсгэх */
  @Post('generate/:courseId')
  @ApiOperation({ summary: 'Сертификат үүсгэх' })
  @ApiResponse({
    status: 201,
    description: 'Сертификат үүсгэх хүсэлт хүлээн авлаа',
  })
  @ApiResponse({ status: 400, description: 'Сургалт дуусаагүй' })
  @ApiResponse({ status: 409, description: 'Аль хэдийн үүсгэгдсэн' })
  async generateCertificate(
    @CurrentUser('id') userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    const certificate = await this.generateCertificateUseCase.execute(userId, courseId);
    return certificate.toResponse();
  }

  /** Сертификатын дэлгэрэнгүй */
  @Get(':id')
  @ApiOperation({ summary: 'Сертификатын дэлгэрэнгүй' })
  @ApiResponse({ status: 200, description: 'Сертификатын мэдээлэл' })
  @ApiResponse({ status: 404, description: 'Олдсонгүй' })
  async getCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const certificate = await this.getCertificateUseCase.execute(id, userId, userRole);
    return certificate.toResponse();
  }

  /** Сертификат устгах — зөвхөн ADMIN */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Сертификат устгах (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Амжилттай устгагдлаа' })
  @ApiResponse({ status: 404, description: 'Олдсонгүй' })
  async deleteCertificate(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteCertificateUseCase.execute(id);
    return { message: 'Сертификат амжилттай устгагдлаа' };
  }
}
