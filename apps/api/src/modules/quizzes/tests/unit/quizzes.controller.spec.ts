import { QuizzesController } from '../../interface/controllers/quizzes.controller';
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
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { QuizAttemptEntity } from '../../domain/entities/quiz-attempt.entity';

describe('QuizzesController', () => {
  let controller: QuizzesController;
  let createQuizUseCase: { execute: jest.Mock };
  let getQuizUseCase: { execute: jest.Mock };
  let getQuizByLessonUseCase: { execute: jest.Mock };
  let updateQuizUseCase: { execute: jest.Mock };
  let deleteQuizUseCase: { execute: jest.Mock };
  let addQuestionUseCase: { execute: jest.Mock };
  let updateQuestionUseCase: { execute: jest.Mock };
  let deleteQuestionUseCase: { execute: jest.Mock };
  let reorderQuestionsUseCase: { execute: jest.Mock };
  let startAttemptUseCase: { execute: jest.Mock };
  let submitAttemptUseCase: { execute: jest.Mock };
  let getAttemptUseCase: { execute: jest.Mock };
  let listMyAttemptsUseCase: { execute: jest.Mock };
  let listStudentAttemptsUseCase: { execute: jest.Mock };
  let gradeAttemptUseCase: { execute: jest.Mock };

  const now = new Date();

  /** Тестэд ашиглах mock quiz entity */
  const mockQuiz = new QuizEntity({
    id: 'quiz-1',
    lessonId: 'lesson-1',
    title: 'Тест quiz',
    description: null,
    timeLimitMinutes: null,
    passingScorePercentage: 70,
    randomizeQuestions: false,
    randomizeOptions: false,
    maxAttempts: null,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock attempt entity */
  const mockAttempt = new QuizAttemptEntity({
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    score: 0,
    maxScore: 0,
    passed: false,
    startedAt: now,
    submittedAt: null,
    createdAt: now,
  });

  beforeEach(() => {
    /** Бүх use case-уудын mock үүсгэх */
    createQuizUseCase = { execute: jest.fn() };
    getQuizUseCase = { execute: jest.fn() };
    getQuizByLessonUseCase = { execute: jest.fn() };
    updateQuizUseCase = { execute: jest.fn() };
    deleteQuizUseCase = { execute: jest.fn() };
    addQuestionUseCase = { execute: jest.fn() };
    updateQuestionUseCase = { execute: jest.fn() };
    deleteQuestionUseCase = { execute: jest.fn() };
    reorderQuestionsUseCase = { execute: jest.fn() };
    startAttemptUseCase = { execute: jest.fn() };
    submitAttemptUseCase = { execute: jest.fn() };
    getAttemptUseCase = { execute: jest.fn() };
    listMyAttemptsUseCase = { execute: jest.fn() };
    listStudentAttemptsUseCase = { execute: jest.fn() };
    gradeAttemptUseCase = { execute: jest.fn() };

    /** Controller-г гараар mock-уудтай үүсгэх */
    controller = new QuizzesController(
      createQuizUseCase as unknown as CreateQuizUseCase,
      getQuizUseCase as unknown as GetQuizUseCase,
      getQuizByLessonUseCase as unknown as GetQuizByLessonUseCase,
      updateQuizUseCase as unknown as UpdateQuizUseCase,
      deleteQuizUseCase as unknown as DeleteQuizUseCase,
      addQuestionUseCase as unknown as AddQuestionUseCase,
      updateQuestionUseCase as unknown as UpdateQuestionUseCase,
      deleteQuestionUseCase as unknown as DeleteQuestionUseCase,
      reorderQuestionsUseCase as unknown as ReorderQuestionsUseCase,
      startAttemptUseCase as unknown as StartAttemptUseCase,
      submitAttemptUseCase as unknown as SubmitAttemptUseCase,
      getAttemptUseCase as unknown as GetAttemptUseCase,
      listMyAttemptsUseCase as unknown as ListMyAttemptsUseCase,
      listStudentAttemptsUseCase as unknown as ListStudentAttemptsUseCase,
      gradeAttemptUseCase as unknown as GradeAttemptUseCase,
    );
  });

  it('POST /quizzes — Quiz үүсгэх: createQuizUseCase.execute дуудаж, toResponse() буцаах', async () => {
    createQuizUseCase.execute.mockResolvedValue(mockQuiz);
    const dto = { lessonId: 'lesson-1', title: 'Тест quiz' };

    const result = await controller.createQuiz('user-1', 'TEACHER', dto as any);

    expect(createQuizUseCase.execute).toHaveBeenCalledWith('user-1', 'TEACHER', dto);
    expect(result).toEqual(mockQuiz.toResponse());
  });

  it('GET /quizzes/:id — Quiz дэлгэрэнгүй: getQuizUseCase.execute дуудах', async () => {
    const mockResult = { quiz: mockQuiz.toResponse(), questions: [] };
    getQuizUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.getQuiz('quiz-1', 'user-1', 'STUDENT');

    expect(getQuizUseCase.execute).toHaveBeenCalledWith('quiz-1', 'user-1', 'STUDENT');
    expect(result).toEqual(mockResult);
  });

  it('GET /quizzes/lesson/:lessonId — Хичээлийн quiz авах: quiz байвал toResponse() буцаах', async () => {
    getQuizByLessonUseCase.execute.mockResolvedValue(mockQuiz);

    const result = await controller.getQuizByLesson('lesson-1');

    expect(getQuizByLessonUseCase.execute).toHaveBeenCalledWith('lesson-1');
    expect(result).toEqual(mockQuiz.toResponse());
  });

  it('GET /quizzes/lesson/:lessonId — Хичээлийн quiz авах: quiz байхгүй бол null буцаах', async () => {
    getQuizByLessonUseCase.execute.mockResolvedValue(null);

    const result = await controller.getQuizByLesson('lesson-1');

    expect(getQuizByLessonUseCase.execute).toHaveBeenCalledWith('lesson-1');
    expect(result).toBeNull();
  });

  it('PATCH /quizzes/:id — Quiz шинэчлэх: updateQuizUseCase.execute дуудаж, toResponse() буцаах', async () => {
    updateQuizUseCase.execute.mockResolvedValue(mockQuiz);
    const dto = { title: 'Шинэчилсэн quiz' };

    const result = await controller.updateQuiz('quiz-1', 'user-1', 'TEACHER', dto as any);

    expect(updateQuizUseCase.execute).toHaveBeenCalledWith('quiz-1', 'user-1', 'TEACHER', dto);
    expect(result).toEqual(mockQuiz.toResponse());
  });

  it('DELETE /quizzes/:id — Quiz устгах: deleteQuizUseCase.execute дуудах (void)', async () => {
    deleteQuizUseCase.execute.mockResolvedValue(undefined);

    await controller.deleteQuiz('quiz-1', 'user-1', 'TEACHER');

    expect(deleteQuizUseCase.execute).toHaveBeenCalledWith('quiz-1', 'user-1', 'TEACHER');
  });

  it('POST /quizzes/:id/questions — Асуулт нэмэх: addQuestionUseCase.execute дуудах', async () => {
    const mockResult = { quizId: 'quiz-1', questions: [] };
    addQuestionUseCase.execute.mockResolvedValue(mockResult);
    const dto = {
      type: 'multiple_choice',
      questionText: 'Юу вэ?',
      points: 10,
      options: [
        { optionId: 'a', text: 'A', isCorrect: true },
        { optionId: 'b', text: 'B', isCorrect: false },
      ],
    };

    const result = await controller.addQuestion('quiz-1', 'user-1', 'TEACHER', dto as any);

    expect(addQuestionUseCase.execute).toHaveBeenCalledWith('quiz-1', 'user-1', 'TEACHER', dto);
    expect(result).toEqual(mockResult);
  });

  it('POST /quizzes/:id/attempts — Оролдлого эхлүүлэх: attempt.toResponse() + questions буцаах', async () => {
    const mockQuestions = [
      { questionId: 'q1', type: 'multiple_choice', questionText: 'Юу вэ?', points: 10 },
    ];
    startAttemptUseCase.execute.mockResolvedValue({
      attempt: mockAttempt,
      questions: mockQuestions,
    });

    const result = await controller.startAttempt('quiz-1', 'user-1');

    expect(startAttemptUseCase.execute).toHaveBeenCalledWith('quiz-1', 'user-1');
    expect(result).toEqual({
      attempt: mockAttempt.toResponse(),
      questions: mockQuestions,
    });
  });

  it('POST /quizzes/:id/attempts/:attemptId/submit — Хариулт илгээх: submitAttemptUseCase.execute дуудах', async () => {
    const mockResult = { score: 8, maxScore: 10, passed: true };
    submitAttemptUseCase.execute.mockResolvedValue(mockResult);
    const dto = {
      answers: [{ questionId: 'q1', answerData: { selectedOption: 'a' } }],
    };

    const result = await controller.submitAttempt('quiz-1', 'attempt-1', 'user-1', dto as any);

    expect(submitAttemptUseCase.execute).toHaveBeenCalledWith('quiz-1', 'attempt-1', 'user-1', dto);
    expect(result).toEqual(mockResult);
  });

  it('GET /quizzes/:id/attempts/my — Миний оролдлогууд: listMyAttemptsUseCase.execute дуудах', async () => {
    const mockResult = [mockAttempt.toResponse()];
    listMyAttemptsUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.listMyAttempts('quiz-1', 'user-1');

    expect(listMyAttemptsUseCase.execute).toHaveBeenCalledWith('quiz-1', 'user-1');
    expect(result).toEqual(mockResult);
  });

  it('PATCH /quizzes/attempts/:attemptId/grade — Оролдлого дүгнэх: gradeAttemptUseCase.execute дуудах', async () => {
    const mockResult = { score: 15, maxScore: 20, passed: true };
    gradeAttemptUseCase.execute.mockResolvedValue(mockResult);
    const dto = {
      questionId: 'q4',
      pointsEarned: 15,
      isCorrect: true,
      feedback: 'Маш сайн',
    };

    const result = await controller.gradeAttempt('attempt-1', 'user-1', 'TEACHER', dto as any);

    expect(gradeAttemptUseCase.execute).toHaveBeenCalledWith('attempt-1', 'user-1', 'TEACHER', dto);
    expect(result).toEqual(mockResult);
  });
});
