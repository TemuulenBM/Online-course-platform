import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { ListEnrollmentsQueryDto } from '../../../enrollments/dto/list-enrollments-query.dto';

// DTOs
import { CreateQuizDto } from '../../dto/create-quiz.dto';
import { UpdateQuizDto } from '../../dto/update-quiz.dto';
import { AddQuestionDto } from '../../dto/add-question.dto';
import { UpdateQuestionDto } from '../../dto/update-question.dto';
import { ReorderQuestionsDto } from '../../dto/reorder-questions.dto';
import { SubmitAttemptDto } from '../../dto/submit-attempt.dto';
import { GradeAttemptDto } from '../../dto/grade-attempt.dto';

// Use Cases
import { CreateQuizUseCase } from '../../application/use-cases/create-quiz.use-case';
import { GetQuizUseCase } from '../../application/use-cases/get-quiz.use-case';
import { GetQuizByLessonUseCase } from '../../application/use-cases/get-quiz-by-lesson.use-case';
import { UpdateQuizUseCase } from '../../application/use-cases/update-quiz.use-case';
import { DeleteQuizUseCase } from '../../application/use-cases/delete-quiz.use-case';
import { AddQuestionUseCase } from '../../application/use-cases/add-question.use-case';
import { UpdateQuestionUseCase } from '../../application/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from '../../application/use-cases/delete-question.use-case';
import { ReorderQuestionsUseCase } from '../../application/use-cases/reorder-questions.use-case';
import { StartAttemptUseCase } from '../../application/use-cases/start-attempt.use-case';
import { SubmitAttemptUseCase } from '../../application/use-cases/submit-attempt.use-case';
import { GetAttemptUseCase } from '../../application/use-cases/get-attempt.use-case';
import { ListMyAttemptsUseCase } from '../../application/use-cases/list-my-attempts.use-case';
import { ListStudentAttemptsUseCase } from '../../application/use-cases/list-student-attempts.use-case';
import { GradeAttemptUseCase } from '../../application/use-cases/grade-attempt.use-case';

/**
 * Quiz controller.
 * Quiz CRUD, асуулт удирдлага, оролдлогын lifecycle, дүгнэлт зэрэг endpoint-ууд.
 * Route дараалал: тодорхой path-ууд (:id-ээс ӨМНӨ бүртгэгдэнэ).
 */
@ApiTags('Quiz')
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(
    private readonly createQuizUseCase: CreateQuizUseCase,
    private readonly getQuizUseCase: GetQuizUseCase,
    private readonly getQuizByLessonUseCase: GetQuizByLessonUseCase,
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
    private readonly addQuestionUseCase: AddQuestionUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
    private readonly reorderQuestionsUseCase: ReorderQuestionsUseCase,
    private readonly startAttemptUseCase: StartAttemptUseCase,
    private readonly submitAttemptUseCase: SubmitAttemptUseCase,
    private readonly getAttemptUseCase: GetAttemptUseCase,
    private readonly listMyAttemptsUseCase: ListMyAttemptsUseCase,
    private readonly listStudentAttemptsUseCase: ListStudentAttemptsUseCase,
    private readonly gradeAttemptUseCase: GradeAttemptUseCase,
  ) {}

  // ========================================
  // Тодорхой path-ууд — :id-ээс ӨМНӨ
  // ========================================

  /** Хичээлийн quiz авах */
  @Get('lesson/:lessonId')
  @Public()
  @ApiOperation({ summary: 'Хичээлийн quiz авах' })
  @ApiResponse({ status: 200, description: 'Quiz мэдээлэл' })
  async getQuizByLesson(@Param('lessonId') lessonId: string) {
    const quiz = await this.getQuizByLessonUseCase.execute(lessonId);
    return quiz ? quiz.toResponse() : null;
  }

  /** Оролдлого гараар дүгнэх (TEACHER/ADMIN) */
  @Patch('attempts/:attemptId/grade')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Оролдлого гараар дүгнэх' })
  @ApiResponse({ status: 200, description: 'Дүгнэлт амжилттай' })
  async gradeAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: GradeAttemptDto,
  ) {
    return this.gradeAttemptUseCase.execute(attemptId, userId, userRole, dto);
  }

  // ========================================
  // Quiz CRUD
  // ========================================

  /** Quiz үүсгэх */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Quiz үүсгэх' })
  @ApiResponse({ status: 201, description: 'Quiz амжилттай үүслээ' })
  async createQuiz(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: CreateQuizDto,
  ) {
    const quiz = await this.createQuizUseCase.execute(userId, userRole, dto);
    return quiz.toResponse();
  }

  /** Quiz дэлгэрэнгүй + асуултууд */
  @Get(':id')
  @ApiOperation({ summary: 'Quiz дэлгэрэнгүй авах' })
  @ApiResponse({ status: 200, description: 'Quiz дэлгэрэнгүй мэдээлэл' })
  async getQuiz(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.getQuizUseCase.execute(id, userId, userRole);
  }

  /** Quiz тохиргоо шинэчлэх */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Quiz шинэчлэх' })
  @ApiResponse({ status: 200, description: 'Quiz амжилттай шинэчлэгдлээ' })
  async updateQuiz(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: UpdateQuizDto,
  ) {
    const quiz = await this.updateQuizUseCase.execute(id, userId, userRole, dto);
    return quiz.toResponse();
  }

  /** Quiz устгах */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quiz устгах' })
  @ApiResponse({ status: 204, description: 'Quiz амжилттай устгагдлаа' })
  async deleteQuiz(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    await this.deleteQuizUseCase.execute(id, userId, userRole);
  }

  // ========================================
  // Асуулт удирдлага
  // ========================================

  /** Асуулт нэмэх */
  @Post(':id/questions')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Асуулт нэмэх' })
  @ApiResponse({ status: 201, description: 'Асуулт амжилттай нэмэгдлээ' })
  async addQuestion(
    @Param('id') quizId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: AddQuestionDto,
  ) {
    return this.addQuestionUseCase.execute(quizId, userId, userRole, dto);
  }

  /** Асуултуудын дараалал солих — :questionId-ээс ӨМНӨ бүртгэгдэх ёстой */
  @Patch(':id/questions/reorder')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Асуултуудын дараалал солих' })
  @ApiResponse({ status: 200, description: 'Дараалал амжилттай өөрчлөгдлөө' })
  async reorderQuestions(
    @Param('id') quizId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: ReorderQuestionsDto,
  ) {
    return this.reorderQuestionsUseCase.execute(quizId, userId, userRole, dto);
  }

  /** Асуулт шинэчлэх */
  @Patch(':id/questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Асуулт шинэчлэх' })
  @ApiResponse({ status: 200, description: 'Асуулт амжилттай шинэчлэгдлээ' })
  async updateQuestion(
    @Param('id') quizId: string,
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.updateQuestionUseCase.execute(quizId, questionId, userId, userRole, dto);
  }

  /** Асуулт устгах */
  @Delete(':id/questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Асуулт устгах' })
  @ApiResponse({ status: 204, description: 'Асуулт амжилттай устгагдлаа' })
  async deleteQuestion(
    @Param('id') quizId: string,
    @Param('questionId') questionId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    await this.deleteQuestionUseCase.execute(quizId, questionId, userId, userRole);
  }

  // ========================================
  // Оролдлого (Attempt) lifecycle
  // ========================================

  /** Quiz оролдлого эхлүүлэх */
  @Post(':id/attempts')
  @ApiOperation({ summary: 'Quiz оролдлого эхлүүлэх' })
  @ApiResponse({ status: 201, description: 'Оролдлого эхэллээ' })
  async startAttempt(@Param('id') quizId: string, @CurrentUser('id') userId: string) {
    const result = await this.startAttemptUseCase.execute(quizId, userId);
    return {
      attempt: result.attempt.toResponse(),
      questions: result.questions,
    };
  }

  /** Миний оролдлогуудын жагсаалт */
  @Get(':id/attempts/my')
  @ApiOperation({ summary: 'Миний оролдлогууд' })
  @ApiResponse({ status: 200, description: 'Оролдлогуудын жагсаалт' })
  async listMyAttempts(@Param('id') quizId: string, @CurrentUser('id') userId: string) {
    return this.listMyAttemptsUseCase.execute(quizId, userId);
  }

  /** Оюутнуудын оролдлогуудын жагсаалт (TEACHER/ADMIN) */
  @Get(':id/attempts/students')
  @UseGuards(RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: 'Оюутнуудын оролдлогуудын жагсаалт' })
  @ApiResponse({ status: 200, description: 'Оролдлогуудын жагсаалт' })
  async listStudentAttempts(
    @Param('id') quizId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Query() query: ListEnrollmentsQueryDto,
  ) {
    return this.listStudentAttemptsUseCase.execute(quizId, userId, userRole, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  /** Оролдлогын дэлгэрэнгүй */
  @Get(':id/attempts/:attemptId')
  @ApiOperation({ summary: 'Оролдлогын дэлгэрэнгүй' })
  @ApiResponse({ status: 200, description: 'Оролдлогын дэлгэрэнгүй мэдээлэл' })
  async getAttempt(
    @Param('id') quizId: string,
    @Param('attemptId') attemptId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.getAttemptUseCase.execute(quizId, attemptId, userId, userRole);
  }

  /** Хариулт илгээх */
  @Post(':id/attempts/:attemptId/submit')
  @ApiOperation({ summary: 'Хариулт илгээх' })
  @ApiResponse({ status: 200, description: 'Хариулт амжилттай илгээгдлээ' })
  async submitAttempt(
    @Param('id') quizId: string,
    @Param('attemptId') attemptId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.submitAttemptUseCase.execute(quizId, attemptId, userId, dto);
  }
}
