import { Test, TestingModule } from '@nestjs/testing';
import { ListMyInvoicesUseCase } from '../../application/use-cases/list-my-invoices.use-case';
import { InvoiceRepository } from '../../infrastructure/repositories/invoice.repository';
import { InvoiceEntity } from '../../domain/entities/invoice.entity';

describe('ListMyInvoicesUseCase', () => {
  let useCase: ListMyInvoicesUseCase;
  let invoiceRepository: jest.Mocked<InvoiceRepository>;

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
      providers: [
        ListMyInvoicesUseCase,
        {
          provide: InvoiceRepository,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListMyInvoicesUseCase>(ListMyInvoicesUseCase);
    invoiceRepository = module.get(InvoiceRepository);
  });

  it('нэхэмжлэхүүдийн жагсаалт pagination-тэй авах', async () => {
    invoiceRepository.findByUserId.mockResolvedValue({
      data: [mockInvoice],
      total: 1,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(invoiceRepository.findByUserId).toHaveBeenCalledWith('user-1', {
      page: 1,
      limit: 20,
    });
  });

  it('хоосон жагсаалт буцаах', async () => {
    invoiceRepository.findByUserId.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const result = await useCase.execute('user-1', { page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
