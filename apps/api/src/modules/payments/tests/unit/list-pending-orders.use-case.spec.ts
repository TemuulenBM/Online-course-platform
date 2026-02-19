import { Test, TestingModule } from '@nestjs/testing';
import { ListPendingOrdersUseCase } from '../../application/use-cases/list-pending-orders.use-case';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { OrderEntity } from '../../domain/entities/order.entity';

describe('ListPendingOrdersUseCase', () => {
  let useCase: ListPendingOrdersUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;

  const now = new Date();

  /** Тестэд ашиглах mock хүлээгдэж буй захиалгууд */
  const mockPendingOrders = [
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
      userName: 'Тест Хэрэглэгч',
      courseTitle: 'Сургалт 1',
    }),
    new OrderEntity({
      id: 'order-2',
      userId: 'user-2',
      courseId: 'course-2',
      amount: 30000,
      currency: 'MNT',
      status: 'processing',
      paymentMethod: 'bank_transfer',
      externalPaymentId: null,
      proofImageUrl: '/uploads/payments/order-2/proof.png',
      adminNote: null,
      metadata: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
      userName: 'Өөр Хэрэглэгч',
      courseTitle: 'Сургалт 2',
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPendingOrdersUseCase,
        {
          provide: OrderRepository,
          useValue: {
            findPendingOrders: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListPendingOrdersUseCase>(ListPendingOrdersUseCase);
    orderRepository = module.get(OrderRepository);
  });

  it('хүлээгдэж буй захиалгуудыг pagination-тэй жагсаах', async () => {
    orderRepository.findPendingOrders.mockResolvedValue({
      data: mockPendingOrders,
      total: 2,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(2);
    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(orderRepository.findPendingOrders).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });

  it('хоосон жагсаалт зөв meta-тэй буцаах', async () => {
    orderRepository.findPendingOrders.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.meta).toEqual({
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
  });

  it('page, limit утга default-ээр тохируулагдах', async () => {
    orderRepository.findPendingOrders.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await useCase.execute({});

    expect(orderRepository.findPendingOrders).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
  });
});
