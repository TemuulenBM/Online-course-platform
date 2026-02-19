import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import { PAYMENT_GATEWAY } from '../../domain/interfaces/payment-gateway.interface';
import { OrderEntity } from '../../domain/entities/order.entity';
import { CourseEntity } from '../../../courses/domain/entities/course.entity';
import { EnrollmentEntity } from '../../../enrollments/domain/entities/enrollment.entity';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;
  let courseRepository: jest.Mocked<CourseRepository>;
  let enrollmentRepository: jest.Mocked<EnrollmentRepository>;
  let paymentGateway: { createCheckoutSession: jest.Mock };
  let configService: jest.Mocked<ConfigService>;

  const now = new Date();

  /** Тестэд ашиглах mock сургалт — PUBLISHED, төлбөртэй */
  const mockCourse = new CourseEntity({
    id: 'course-1',
    title: 'Тест сургалт',
    slug: 'test-course',
    description: 'Тайлбар',
    instructorId: 'instructor-1',
    categoryId: 'cat-1',
    price: 50000,
    discountPrice: null,
    difficulty: 'beginner',
    language: 'mn',
    status: 'published',
    thumbnailUrl: null,
    durationMinutes: 120,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  /** Тестэд ашиглах mock сургалт — DRAFT */
  const mockDraftCourse = new CourseEntity({
    ...mockCourse,
    id: 'course-draft',
    status: 'draft',
    publishedAt: null,
  });

  /** Тестэд ашиглах mock сургалт — үнэгүй */
  const mockFreeCourse = new CourseEntity({
    ...mockCourse,
    id: 'course-free',
    price: 0,
    discountPrice: null,
  });

  /** Тестэд ашиглах mock захиалга */
  const mockOrder = new OrderEntity({
    id: 'order-1',
    userId: 'user-1',
    courseId: 'course-1',
    amount: 50000,
    currency: 'MNT',
    status: 'pending',
    paymentMethod: 'bank_transfer',
    externalPaymentId: null,
    proofImageUrl: null,
    adminNote: null,
    metadata: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
    courseTitle: 'Тест сургалт',
    courseSlug: 'test-course',
    courseInstructorId: 'instructor-1',
  });

  /** Тестэд ашиглах mock элсэлт — ACTIVE */
  const mockActiveEnrollment = new EnrollmentEntity({
    id: 'enrollment-1',
    userId: 'user-1',
    courseId: 'course-1',
    status: 'active',
    enrolledAt: now,
    expiresAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  beforeEach(async () => {
    paymentGateway = {
      createCheckoutSession: jest.fn().mockResolvedValue({
        sessionId: 'session-123',
        sessionUrl: null,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        {
          provide: OrderRepository,
          useValue: {
            create: jest.fn(),
            findByUserAndCourse: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CourseRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EnrollmentRepository,
          useValue: {
            findByUserAndCourse: jest.fn(),
          },
        },
        {
          provide: PAYMENT_GATEWAY,
          useValue: paymentGateway,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('MNT'),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    orderRepository = module.get(OrderRepository);
    courseRepository = module.get(CourseRepository);
    enrollmentRepository = module.get(EnrollmentRepository);
    configService = module.get(ConfigService);
  });

  it('сургалт олдоогүй үед NotFoundException шидэх', async () => {
    courseRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', 'user@test.com', { courseId: 'nonexistent' }),
    ).rejects.toThrow(NotFoundException);

    expect(courseRepository.findById).toHaveBeenCalledWith('nonexistent');
  });

  it('сургалт PUBLISHED биш үед BadRequestException шидэх', async () => {
    courseRepository.findById.mockResolvedValue(mockDraftCourse);

    await expect(
      useCase.execute('user-1', 'user@test.com', { courseId: 'course-draft' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('үнэгүй сургалтад BadRequestException шидэх', async () => {
    courseRepository.findById.mockResolvedValue(mockFreeCourse);

    await expect(
      useCase.execute('user-1', 'user@test.com', { courseId: 'course-free' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('ACTIVE элсэлт байгаа үед ConflictException шидэх', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(mockActiveEnrollment);

    await expect(
      useCase.execute('user-1', 'user@test.com', { courseId: 'course-1' }),
    ).rejects.toThrow(ConflictException);

    expect(enrollmentRepository.findByUserAndCourse).toHaveBeenCalledWith('user-1', 'course-1');
  });

  it('PENDING захиалга байгаа үед ConflictException шидэх', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
    orderRepository.findByUserAndCourse.mockResolvedValue(mockOrder);

    await expect(
      useCase.execute('user-1', 'user@test.com', { courseId: 'course-1' }),
    ).rejects.toThrow(ConflictException);

    expect(orderRepository.findByUserAndCourse).toHaveBeenCalledWith('user-1', 'course-1');
  });

  it('амжилттай захиалга үүсгэх', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
    orderRepository.findByUserAndCourse.mockResolvedValue(null);
    orderRepository.create.mockResolvedValue(mockOrder);
    orderRepository.update.mockResolvedValue(mockOrder);

    const result = await useCase.execute('user-1', 'user@test.com', {
      courseId: 'course-1',
      paymentMethod: 'bank_transfer',
    });

    expect(result).toEqual(mockOrder);
    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        courseId: 'course-1',
        amount: 50000,
        currency: 'MNT',
        paymentMethod: 'bank_transfer',
      }),
    );
    expect(paymentGateway.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-1',
        amount: 50000,
        currency: 'MNT',
        courseTitle: 'Тест сургалт',
        customerEmail: 'user@test.com',
      }),
    );
    expect(orderRepository.update).toHaveBeenCalledWith('order-1', {
      externalPaymentId: 'session-123',
    });
  });

  it('хямдралтай үнэ байвал discountPrice ашиглах', async () => {
    const discountCourse = new CourseEntity({
      ...mockCourse,
      discountPrice: 30000,
    });
    courseRepository.findById.mockResolvedValue(discountCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
    orderRepository.findByUserAndCourse.mockResolvedValue(null);
    orderRepository.create.mockResolvedValue(mockOrder);
    orderRepository.update.mockResolvedValue(mockOrder);

    await useCase.execute('user-1', 'user@test.com', { courseId: 'course-1' });

    expect(orderRepository.create).toHaveBeenCalledWith(expect.objectContaining({ amount: 30000 }));
  });

  it('payment gateway алдаа гарахад захиалга үүсмэл байдлаар хадгалагдах', async () => {
    courseRepository.findById.mockResolvedValue(mockCourse);
    enrollmentRepository.findByUserAndCourse.mockResolvedValue(null);
    orderRepository.findByUserAndCourse.mockResolvedValue(null);
    orderRepository.create.mockResolvedValue(mockOrder);
    paymentGateway.createCheckoutSession.mockRejectedValue(new Error('Gateway timeout'));

    const result = await useCase.execute('user-1', 'user@test.com', { courseId: 'course-1' });

    expect(result).toEqual(mockOrder);
    expect(orderRepository.update).not.toHaveBeenCalled();
  });
});
