import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsModule } from '../lessons/lessons.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { ProgressModule } from '../progress/progress.module';

// Controller
import { QuizzesController } from './interface/controllers/quizzes.controller';

// Mongoose Schemas
import { QuizQuestions, QuizQuestionsSchema } from './infrastructure/schemas/quiz-questions.schema';
import { QuizAnswers, QuizAnswersSchema } from './infrastructure/schemas/quiz-answers.schema';

// Use Cases
import { CreateQuizUseCase } from './application/use-cases/create-quiz.use-case';
import { GetQuizUseCase } from './application/use-cases/get-quiz.use-case';
import { GetQuizByLessonUseCase } from './application/use-cases/get-quiz-by-lesson.use-case';
import { UpdateQuizUseCase } from './application/use-cases/update-quiz.use-case';
import { DeleteQuizUseCase } from './application/use-cases/delete-quiz.use-case';
import { AddQuestionUseCase } from './application/use-cases/add-question.use-case';
import { UpdateQuestionUseCase } from './application/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from './application/use-cases/delete-question.use-case';
import { ReorderQuestionsUseCase } from './application/use-cases/reorder-questions.use-case';
import { StartAttemptUseCase } from './application/use-cases/start-attempt.use-case';
import { SubmitAttemptUseCase } from './application/use-cases/submit-attempt.use-case';
import { GetAttemptUseCase } from './application/use-cases/get-attempt.use-case';
import { ListMyAttemptsUseCase } from './application/use-cases/list-my-attempts.use-case';
import { ListStudentAttemptsUseCase } from './application/use-cases/list-student-attempts.use-case';
import { GradeAttemptUseCase } from './application/use-cases/grade-attempt.use-case';

// Infrastructure
import { QuizRepository } from './infrastructure/repositories/quiz.repository';
import { QuizQuestionsRepository } from './infrastructure/repositories/quiz-questions.repository';
import { QuizAnswersRepository } from './infrastructure/repositories/quiz-answers.repository';
import { QuizGradingService } from './infrastructure/services/quiz-grading.service';
import { QuizCacheService } from './infrastructure/services/quiz-cache.service';

/**
 * Quizzes модуль.
 * Quiz CRUD, асуулт удирдлага, оролдлогын lifecycle,
 * автомат дүгнэлт, гараар дүгнэлт зэрэг функцүүдийг удирдана.
 * Dual-database: PostgreSQL (quiz metadata + attempts) + MongoDB (questions + answers).
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizQuestions.name, schema: QuizQuestionsSchema },
      { name: QuizAnswers.name, schema: QuizAnswersSchema },
    ]),
    LessonsModule,
    EnrollmentsModule,
    ProgressModule,
  ],
  controllers: [QuizzesController],
  providers: [
    // Use Cases
    CreateQuizUseCase,
    GetQuizUseCase,
    GetQuizByLessonUseCase,
    UpdateQuizUseCase,
    DeleteQuizUseCase,
    AddQuestionUseCase,
    UpdateQuestionUseCase,
    DeleteQuestionUseCase,
    ReorderQuestionsUseCase,
    StartAttemptUseCase,
    SubmitAttemptUseCase,
    GetAttemptUseCase,
    ListMyAttemptsUseCase,
    ListStudentAttemptsUseCase,
    GradeAttemptUseCase,
    // Infrastructure
    QuizRepository,
    QuizQuestionsRepository,
    QuizAnswersRepository,
    QuizGradingService,
    QuizCacheService,
  ],
  exports: [QuizRepository],
})
export class QuizzesModule {}
