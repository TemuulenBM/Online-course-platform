import { Test, TestingModule } from '@nestjs/testing';
import { ListMyOrdersUseCase } from '../../application/use-cases/list-my-orders.use-case';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { OrderEntity } from '../../domain/entities/order.entity';

describe('ListMyOrdersUseCase', () => {
  let useCase: ListMyOrdersUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock захиалгууд */
  const mockOrders = [
    new OrderEntity({
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
      courseTitle: 'Сургалт 1',
    }),
    new OrderEntity({
      id: 'order-2',
      userId: 'user-1',
      courseId: 'course-2',
      amount: 30000,
      currency: 'MNT',
      status: 'paid',
      paymentMethod: 'bank_transfer',
      externalPaymentId: null,
      proofImageUrl: null,
      adminNote: null,
      metadata: null,
      paidAt: now,
      createdAt: now,
      updatedAt: now,
      courseTitle: 'Сургалт 2',
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListMyOrdersUseCase,
        {
          provide: OrderRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListMyOrdersUseCase>(ListMyOrdersUseCase);
    orderRepository = module.get(OrderRepository);
  });

  it('хэрэглэгчийн захиалгуудыг pagination-тэй жагсаах', async () => {
    orderRepository.findByUserId.mockResolvedValue({
      data: mockOrders,
      total: 2,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(2);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(orderRepository.findByUserId).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
      status: undefined,
    });
  });

  it('status шүүлтүүрээр жагсаах', async () => {
    orderRepository.findByUserId.mockResolvedValue({
      data: [mockOrders[0]],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-1', {
      page: 1,
      limit: 20,
      status: 'pending',
    });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(orderRepository.findByUserId).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
      status: 'pending',
    });
  });

  it('хоосон жагсаалт зөв meta-тэй буцаах', async () => {
    orderRepository.findByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.meta).toEqual({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
  });
});
