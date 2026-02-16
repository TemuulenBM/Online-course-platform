import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { CreateCategoryDto } from '../../dto/create-category.dto';
import { UpdateCategoryDto } from '../../dto/update-category.dto';
import { CategoryResponseDto } from '../../dto/category-response.dto';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { GetCategoryUseCase } from '../../application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';

/**
 * Ангиллын controller.
 * Ангиллын CRUD endpoint-уудыг удирдана. Админ удирдлага + public жагсаалт.
 */
@ApiTags('Ангиллууд')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ангилал үүсгэх (Зөвхөн Админ)' })
  @ApiResponse({ status: 201, description: 'Ангилал амжилттай үүсгэгдлээ', type: CategoryResponseDto })
  @ApiResponse({ status: 409, description: 'Энэ нэртэй ангилал аль хэдийн байна' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.createCategoryUseCase.execute(dto);
    return category.toResponse();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Ангиллуудын жагсаалт (мод бүтцээр)' })
  @ApiResponse({ status: 200, description: 'Ангиллуудын жагсаалт' })
  async list() {
    return this.listCategoriesUseCase.execute();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Ангиллын дэлгэрэнгүй (сургалтуудын тоотой)' })
  @ApiResponse({ status: 200, description: 'Ангиллын мэдээлэл', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Ангилал олдсонгүй' })
  async getById(@Param('id') id: string) {
    const category = await this.getCategoryUseCase.execute(id);
    return category.toResponse();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ангилал шинэчлэх (Зөвхөн Админ)' })
  @ApiResponse({ status: 200, description: 'Ангилал амжилттай шинэчлэгдлээ', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Ангилал олдсонгүй' })
  @ApiResponse({ status: 409, description: 'Энэ нэртэй ангилал аль хэдийн байна' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.updateCategoryUseCase.execute(id, dto);
    return category.toResponse();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ангилал устгах (Зөвхөн Админ)' })
  @ApiResponse({ status: 204, description: 'Ангилал амжилттай устгагдлаа' })
  @ApiResponse({ status: 404, description: 'Ангилал олдсонгүй' })
  @ApiResponse({ status: 409, description: 'Сургалтууд хамааруулсан тул устгах боломжгүй' })
  @ApiResponse({ status: 403, description: 'Эрх хүрэхгүй' })
  async delete(@Param('id') id: string) {
    await this.deleteCategoryUseCase.execute(id);
  }
}
