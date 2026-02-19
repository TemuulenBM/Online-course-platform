import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../interface/controllers/orders.controller';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { UploadPaymentProofUseCase } from '../../application/use-cases/upload-payment-proof.use-case';
import { ApproveOrderUseCase } from '../../application/use-cases/approve-order.use-case';
import { RejectOrderUseCase } from '../../application/use-cases/reject-order.use-case';
import { ListMyOrdersUseCase } from '../../application/use-cases/list-my-orders.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { ListPendingOrdersUseCase } from '../../application/use-cases/list-pending-orders.use-case';
import { OrderEntity } from '../../domain/entities/order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let createOrderUseCase: jest.Mocked<CreateOrderUseCase>;
  let uploadPaymentProofUseCase: jest.Mocked<UploadPaymentProofUseCase>;
  let approveOrderUseCase: jest.Mocked<ApproveOrderUseCase>;
  let rejectOrderUseCase: jest.Mocked<RejectOrderUseCase>;
  let listMyOrdersUseCase: jest.Mocked<ListMyOrdersUseCase>;
  let getOrderUseCase: jest.Mocked<GetOrderUseCase>;
  let listPendingOrdersUseCase: jest.Mocked<ListPendingOrdersUseCase>;

  const now = new Date();

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
  });

  /** Жагсаалтын mock хариу */
  const mockListResult = {
    data: [mockOrder.toResponse()],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: CreateOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UploadPaymentProofUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ApproveOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RejectOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListMyOrdersUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetOrderUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListPendingOrdersUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    createOrderUseCase = module.get(CreateOrderUseCase);
    uploadPaymentProofUseCase = module.get(UploadPaymentProofUseCase);
    approveOrderUseCase = module.get(ApproveOrderUseCase);
    rejectOrderUseCase = module.get(RejectOrderUseCase);
    listMyOrdersUseCase = module.get(ListMyOrdersUseCase);
    getOrderUseCase = module.get(GetOrderUseCase);
    listPendingOrdersUseCase = module.get(ListPendingOrdersUseCase);
  });

  it('controller тодорхойлогдсон байх', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('CreateOrderUseCase-г зөв параметрүүдтэй дуудаж toResponse() буцаах', async () => {
      createOrderUseCase.execute.mockResolvedValue(mockOrder);

      const dto = { courseId: 'course-1', paymentMethod: 'bank_transfer' };
      const result = await controller.createOrder('user-1', 'user@test.com', dto);

      expect(createOrderUseCase.execute).toHaveBeenCalledWith('user-1', 'user@test.com', dto);
      expect(result).toEqual(mockOrder.toResponse());
    });
  });

  describe('listMyOrders', () => {
    it('ListMyOrdersUseCase-г зөв параметрүүдтэй дуудах', async () => {
      listMyOrdersUseCase.execute.mockResolvedValue(mockListResult);

      const query = { page: 1, limit: 20 };
      const result = await controller.listMyOrders('user-1', query);

      expect(listMyOrdersUseCase.execute).toHaveBeenCalledWith('user-1', {
        page: 1,
        limit: 20,
        status: undefined,
      });
      expect(result).toEqual(mockListResult);
    });
  });

  describe('listPendingOrders', () => {
    it('ListPendingOrdersUseCase-г зөв параметрүүдтэй дуудах', async () => {
      listPendingOrdersUseCase.execute.mockResolvedValue(mockListResult);

      const query = { page: 1, limit: 20 };
      const result = await controller.listPendingOrders(query);

      expect(listPendingOrdersUseCase.execute).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(mockListResult);
    });
  });

  describe('getOrder', () => {
    it('GetOrderUseCase-г зөв параметрүүдтэй дуудаж toResponse() буцаах', async () => {
      getOrderUseCase.execute.mockResolvedValue(mockOrder);

      const result = await controller.getOrder('order-1', 'user-1', 'STUDENT');

      expect(getOrderUseCase.execute).toHaveBeenCalledWith('order-1', 'user-1', 'STUDENT');
      expect(result).toEqual(mockOrder.toResponse());
    });
  });

  describe('uploadProof', () => {
    it('UploadPaymentProofUseCase-г зөв параметрүүдтэй дуудаж toResponse() буцаах', async () => {
      const updatedOrder = new OrderEntity({
        ...mockOrder,
        status: 'processing',
        proofImageUrl: '/uploads/payments/order-1/proof.png',
      });
      uploadPaymentProofUseCase.execute.mockResolvedValue(updatedOrder);

      const mockFile = {
        originalname: 'proof.png',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const result = await controller.uploadProof('order-1', 'user-1', mockFile);

      expect(uploadPaymentProofUseCase.execute).toHaveBeenCalledWith('order-1', 'user-1', mockFile);
      expect(result).toEqual(updatedOrder.toResponse());
    });
  });

  describe('approveOrder', () => {
    it('ApproveOrderUseCase-г зөв параметрүүдтэй дуудаж toResponse() буцаах', async () => {
      const approvedOrder = new OrderEntity({
        ...mockOrder,
        status: 'paid',
        paidAt: now,
        adminNote: 'Баталгаажууллаа',
      });
      approveOrderUseCase.execute.mockResolvedValue(approvedOrder);

      const dto = { adminNote: 'Баталгаажууллаа' };
      const result = await controller.approveOrder('order-1', dto);

      expect(approveOrderUseCase.execute).toHaveBeenCalledWith('order-1', dto);
      expect(result).toEqual(approvedOrder.toResponse());
    });
  });

  describe('rejectOrder', () => {
    it('RejectOrderUseCase-г зөв параметрүүдтэй дуудаж toResponse() буцаах', async () => {
      const rejectedOrder = new OrderEntity({
        ...mockOrder,
        status: 'failed',
        adminNote: 'Баримт тодорхойгүй',
      });
      rejectOrderUseCase.execute.mockResolvedValue(rejectedOrder);

      const dto = { adminNote: 'Баримт тодорхойгүй' };
      const result = await controller.rejectOrder('order-1', dto);

      expect(rejectOrderUseCase.execute).toHaveBeenCalledWith('order-1', dto);
      expect(result).toEqual(rejectedOrder.toResponse());
    });
  });
});
