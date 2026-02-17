import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentController } from '../../interface/controllers/enrollment.controller';
import { EnrollUseCase } from '../../application/use-cases/enroll.use-case';
import { ListMyEnrollmentsUseCase } from '../../application/use-cases/list-my-enrollments.use-case';
import { ListCourseEnrollmentsUseCase } from '../../application/use-cases/list-course-enrollments.use-case';
import { CheckEnrollmentUseCase } from '../../application/use-cases/check-enrollment.use-case';
import { GetEnrollmentUseCase } from '../../application/use-cases/get-enrollment.use-case';
import { CancelEnrollmentUseCase } from '../../application/use-cases/cancel-enrollment.use-case';
import { CompleteEnrollmentUseCase } from '../../application/use-cases/complete-enrollment.use-case';
import { DeleteEnrollmentUseCase } from '../../application/use-cases/delete-enrollment.use-case';
import { EnrollmentEntity } from '../../domain/entities/enrollment.entity';

describe('EnrollmentController', () => {
  let controller: EnrollmentController;
  let enrollUseCase: jest.Mocked<EnrollUseCase>;
  let listMyUseCase: jest.Mocked<ListMyEnrollmentsUseCase>;
  let listCourseUseCase: jest.Mocked<ListCourseEnrollmentsUseCase>;
  let checkUseCase: jest.Mocked<CheckEnrollmentUseCase>;
  let getUseCase: jest.Mocked<GetEnrollmentUseCase>;
  let cancelUseCase: jest.Mocked<CancelEnrollmentUseCase>;
  let completeUseCase: jest.Mocked<CompleteEnrollmentUseCase>;
  let deleteUseCase: jest.Mocked<DeleteEnrollmentUseCase>;

  const now = new Date();

  const mockEnrollment = new EnrollmentEntity({
    id: 'enrollment-id-1',
    userId: 'user-id-1',
    courseId: 'course-id-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    courseTitle: 'Сургалт',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [
        { provide: EnrollUseCase, useValue: { execute: jest.fn() } },
        { provide: ListMyEnrollmentsUseCase, useValue: { execute: jest.fn() } },
        { provide: ListCourseEnrollmentsUseCase, useValue: { execute: jest.fn() } },
        { provide: CheckEnrollmentUseCase, useValue: { execute: jest.fn() } },
        { provide: GetEnrollmentUseCase, useValue: { execute: jest.fn() } },
        { provide: CancelEnrollmentUseCase, useValue: { execute: jest.fn() } },
        { provide: CompleteEnrollmentUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteEnrollmentUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<EnrollmentController>(EnrollmentController);
    enrollUseCase = module.get(EnrollUseCase);
    listMyUseCase = module.get(ListMyEnrollmentsUseCase);
    listCourseUseCase = module.get(ListCourseEnrollmentsUseCase);
    checkUseCase = module.get(CheckEnrollmentUseCase);
    getUseCase = module.get(GetEnrollmentUseCase);
    cancelUseCase = module.get(CancelEnrollmentUseCase);
    completeUseCase = module.get(CompleteEnrollmentUseCase);
    deleteUseCase = module.get(DeleteEnrollmentUseCase);
  });

  it('POST /enrollments — элсэх', async () => {
    enrollUseCase.execute.mockResolvedValue(mockEnrollment);

    const result = await controller.enroll('user-id-1', { courseId: 'course-id-1' });

    expect(result).toEqual(mockEnrollment.toResponse());
    expect(enrollUseCase.execute).toHaveBeenCalledWith('user-id-1', { courseId: 'course-id-1' });
  });

  it('GET /enrollments/my — миний элсэлтүүд', async () => {
    const mockResult = {
      data: [mockEnrollment.toResponse()],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    listMyUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.listMyEnrollments('user-id-1', { page: 1, limit: 20 });

    expect(result).toEqual(mockResult);
    expect(listMyUseCase.execute).toHaveBeenCalledWith('user-id-1', { page: 1, limit: 20 });
  });

  it('GET /enrollments/course/:courseId — сургалтын оюутнууд', async () => {
    const mockResult = {
      data: [mockEnrollment.toResponse()],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    listCourseUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.listCourseEnrollments(
      'course-id-1',
      'user-id-1',
      'TEACHER',
      {},
    );

    expect(result).toEqual(mockResult);
    expect(listCourseUseCase.execute).toHaveBeenCalledWith(
      'course-id-1',
      'user-id-1',
      'TEACHER',
      {},
    );
  });

  it('GET /enrollments/check/:courseId — шалгах', async () => {
    const mockResult = {
      enrolled: true,
      status: 'active',
      enrollmentId: 'enrollment-id-1',
      enrolledAt: now,
    };
    checkUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.checkEnrollment('user-id-1', 'course-id-1');

    expect(result).toEqual(mockResult);
    expect(checkUseCase.execute).toHaveBeenCalledWith('user-id-1', 'course-id-1');
  });

  it('GET /enrollments/:id — дэлгэрэнгүй', async () => {
    getUseCase.execute.mockResolvedValue(mockEnrollment);

    const result = await controller.getById('enrollment-id-1', 'user-id-1', 'STUDENT');

    expect(result).toEqual(mockEnrollment.toResponse());
    expect(getUseCase.execute).toHaveBeenCalledWith('enrollment-id-1', 'user-id-1', 'STUDENT');
  });

  it('PATCH /enrollments/:id/cancel — цуцлах', async () => {
    const cancelledEnrollment = new EnrollmentEntity({
      ...mockEnrollment,
      status: 'cancelled',
    } as any);
    cancelUseCase.execute.mockResolvedValue(cancelledEnrollment);

    const result = await controller.cancel('enrollment-id-1', 'user-id-1', 'STUDENT');

    expect(result.status).toBe('cancelled');
    expect(cancelUseCase.execute).toHaveBeenCalledWith('enrollment-id-1', 'user-id-1', 'STUDENT');
  });

  it('PATCH /enrollments/:id/complete — дуусгах', async () => {
    const completedEnrollment = new EnrollmentEntity({
      ...mockEnrollment,
      status: 'completed',
      completedAt: now,
    } as any);
    completeUseCase.execute.mockResolvedValue(completedEnrollment);

    const result = await controller.complete('enrollment-id-1');

    expect(result.status).toBe('completed');
    expect(completeUseCase.execute).toHaveBeenCalledWith('enrollment-id-1');
  });

  it('DELETE /enrollments/:id — устгах', async () => {
    deleteUseCase.execute.mockResolvedValue(undefined);

    await controller.delete('enrollment-id-1');

    expect(deleteUseCase.execute).toHaveBeenCalledWith('enrollment-id-1');
  });
});
