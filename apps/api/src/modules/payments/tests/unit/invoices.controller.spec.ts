import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from '../../interface/controllers/invoices.controller';
import { ListMyInvoicesUseCase } from '../../application/use-cases/list-my-invoices.use-case';
import { GetInvoiceUseCase } from '../../application/use-cases/get-invoice.use-case';
import { InvoiceEntity } from '../../domain/entities/invoice.entity';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let listMyInvoicesUseCase: jest.Mocked<ListMyInvoicesUseCase>;
  let getInvoiceUseCase: jest.Mocked<GetInvoiceUseCase>;

  const now = new Date();

  /** Тестэд ашиглах mock нэхэмжлэх */
  const mockInvoice = new InvoiceEntity({
    id: 'inv-1',
    orderId: 'order-1',
    invoiceNumber: 'INV-2026-ABCD1234',
    amount: 50000,
    currency: 'MNT',
    pdfUrl: null,
    createdAt: now,
    courseTitle: 'Test Course',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    orderUserId: 'user-1',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: ListMyInvoicesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetInvoiceUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
    listMyInvoicesUseCase = module.get(ListMyInvoicesUseCase);
    getInvoiceUseCase = module.get(GetInvoiceUseCase);
  });

  it('listMyInvoices — use case дуудаж жагсаалт буцаах', async () => {
    const mockResult = {
      data: [mockInvoice.toResponse()],
      total: 1,
      page: 1,
      limit: 20,
    };
    listMyInvoicesUseCase.execute.mockResolvedValue(mockResult);

    const result = await controller.listMyInvoices('user-1', {
      page: 1,
      limit: 20,
    });

    expect(listMyInvoicesUseCase.execute).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
    });
    expect(result).toEqual(mockResult);
  });

  it('getInvoice — use case дуудаж toResponse буцаах', async () => {
    getInvoiceUseCase.execute.mockResolvedValue(mockInvoice);

    const result = await controller.getInvoice('inv-1', 'user-1', 'STUDENT');

    expect(getInvoiceUseCase.execute).toHaveBeenCalledWith('inv-1', 'user-1', 'STUDENT');
    expect(result).toEqual(mockInvoice.toResponse());
  });
});
