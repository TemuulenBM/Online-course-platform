import { QuizGradingService } from '../../infrastructure/services/quiz-grading.service';

describe('QuizGradingService', () => {
  let service: QuizGradingService;

  beforeEach(() => {
    /** Dependency байхгүй — шууд instance үүсгэх */
    service = new QuizGradingService();
  });

  /** Тестэд ашиглах mock асуултууд */
  const questions = [
    {
      questionId: 'q1',
      type: 'multiple_choice',
      points: 10,
      options: [
        { optionId: 'a', isCorrect: true },
        { optionId: 'b', isCorrect: false },
      ],
    },
    {
      questionId: 'q2',
      type: 'true_false',
      points: 5,
      correctAnswer: true,
    },
    {
      questionId: 'q3',
      type: 'fill_blank',
      points: 5,
      correctAnswers: ['React', 'react'],
      caseSensitive: false,
    },
    {
      questionId: 'q4',
      type: 'essay',
      points: 20,
    },
    {
      questionId: 'q5',
      type: 'code_challenge',
      points: 15,
    },
  ];

  it('Multiple choice зөв хариулт — isCorrect=true, pointsEarned=points', () => {
    const answers = [{ questionId: 'q1', answerData: { selectedOption: 'a' } }];

    const result = service.gradeAnswers(answers, questions);

    expect(result.gradedAnswers[0].answerData.isCorrect).toBe(true);
    expect(result.gradedAnswers[0].answerData.pointsEarned).toBe(10);
    expect(result.score).toBe(10);
  });

  it('Multiple choice буруу хариулт — isCorrect=false, pointsEarned=0', () => {
    const answers = [{ questionId: 'q1', answerData: { selectedOption: 'b' } }];

    const result = service.gradeAnswers(answers, questions);

    expect(result.gradedAnswers[0].answerData.isCorrect).toBe(false);
    expect(result.gradedAnswers[0].answerData.pointsEarned).toBe(0);
    expect(result.score).toBe(0);
  });

  it('True/false зөв хариулт — isCorrect=true', () => {
    const answers = [{ questionId: 'q2', answerData: { selectedAnswer: true } }];

    const result = service.gradeAnswers(answers, questions);

    expect(result.gradedAnswers[0].answerData.isCorrect).toBe(true);
    expect(result.gradedAnswers[0].answerData.pointsEarned).toBe(5);
    expect(result.score).toBe(5);
  });

  it('True/false буруу хариулт — isCorrect=false', () => {
    const answers = [{ questionId: 'q2', answerData: { selectedAnswer: false } }];

    const result = service.gradeAnswers(answers, questions);

    expect(result.gradedAnswers[0].answerData.isCorrect).toBe(false);
    expect(result.gradedAnswers[0].answerData.pointsEarned).toBe(0);
    expect(result.score).toBe(0);
  });

  it('Fill blank зөв хариулт (case insensitive) — isCorrect=true', () => {
    const answers = [{ questionId: 'q3', answerData: { filledAnswer: 'react' } }];

    const result = service.gradeAnswers(answers, questions);

    expect(result.gradedAnswers[0].answerData.isCorrect).toBe(true);
    expect(result.gradedAnswers[0].answerData.pointsEarned).toBe(5);
    expect(result.score).toBe(5);
  });

  it('Fill blank буруу хариулт — isCorrect=false', () => {
    const answers = [{ questionId: 'q3', answerData: { filledAnswer: 'Angular' } }];

    const result = service.gradeAnswers(answers, questions);

    expect(result.gradedAnswers[0].answerData.isCorrect).toBe(false);
    expect(result.gradedAnswers[0].answerData.pointsEarned).toBe(0);
    expect(result.score).toBe(0);
  });

  it('Essay — isCorrect=null, pointsEarned=0 (гараар дүгнэх)', () => {
    const answers = [{ questionId: 'q4', answerData: { submittedText: 'Essay text here' } }];

    const result = service.gradeAnswers(answers, questions);

    expect(result.gradedAnswers[0].answerData.isCorrect).toBeNull();
    expect(result.gradedAnswers[0].answerData.pointsEarned).toBe(0);
    /** Essay-ийн оноо maxScore-д тооцогдох боловч score-д нэмэгдэхгүй */
    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(20);
  });

  it('Code challenge — isCorrect=null, pointsEarned=0 (гараар дүгнэх)', () => {
    const answers = [{ questionId: 'q5', answerData: { submittedCode: 'code here' } }];

    const result = service.gradeAnswers(answers, questions);

    expect(result.gradedAnswers[0].answerData.isCorrect).toBeNull();
    expect(result.gradedAnswers[0].answerData.pointsEarned).toBe(0);
    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(15);
  });

  it('Олон зөв хариулттай бол нийт оноо зөв тооцоолох', () => {
    /** q1 (10 оноо) + q2 (5 оноо) + q3 (5 оноо) = 20 оноо */
    const answers = [
      { questionId: 'q1', answerData: { selectedOption: 'a' } },
      { questionId: 'q2', answerData: { selectedAnswer: true } },
      { questionId: 'q3', answerData: { filledAnswer: 'React' } },
    ];

    const result = service.gradeAnswers(answers, questions);

    expect(result.score).toBe(20);
    expect(result.maxScore).toBe(20);
    expect(result.gradedAnswers).toHaveLength(3);
  });

  it('Асуулт олдоогүй бол алгасах — score-д нөлөөлөхгүй', () => {
    const answers = [
      { questionId: 'nonexistent', answerData: { selectedOption: 'a' } },
      { questionId: 'q1', answerData: { selectedOption: 'a' } },
    ];

    const result = service.gradeAnswers(answers, questions);

    /** Олдоогүй асуултын хариулт өөрчлөгдөхгүй буцна */
    expect(result.gradedAnswers[0].questionId).toBe('nonexistent');
    /** Зөвхөн олдсон асуултын оноог тооцно */
    expect(result.score).toBe(10);
    expect(result.maxScore).toBe(10);
  });
});
