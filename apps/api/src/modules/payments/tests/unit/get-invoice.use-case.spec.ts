import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetInvoiceUseCase } from '../../application/use-cases/get-invoice.use-case';
import { InvoiceRepository } from '../../infrastructure/repositories/invoice.repository';
import { InvoiceEntity } from '../../domain/entities/invoice.entity';

describe('GetInvoiceUseCase', () => {
  let useCase: GetInvoiceUseCase;
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
        GetInvoiceUseCase,
        {
          provide: InvoiceRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetInvoiceUseCase>(GetInvoiceUseCase);
    invoiceRepository = module.get(InvoiceRepository);
  });

  it('нэхэмжлэх олдоогүй үед NotFoundException', async () => {
    invoiceRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inv-999', 'user-1', 'STUDENT')).rejects.toThrow(
      NotFoundException,
    );

    expect(invoiceRepository.findById).toHaveBeenCalledWith('inv-999');
  });

  it('өөрийн биш нэхэмжлэх харах үед ForbiddenException', async () => {
    invoiceRepository.findById.mockResolvedValue(mockInvoice);

    await expect(useCase.execute('inv-1', 'user-other', 'STUDENT')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('нэхэмжлэх амжилттай авах (эзэмшигч)', async () => {
    invoiceRepository.findById.mockResolvedValue(mockInvoice);

    const result = await useCase.execute('inv-1', 'user-1', 'STUDENT');

    expect(result).toEqual(mockInvoice);
    expect(invoiceRepository.findById).toHaveBeenCalledWith('inv-1');
  });

  it('ADMIN нэхэмжлэх амжилттай авах (өөрийнх биш ч)', async () => {
    invoiceRepository.findById.mockResolvedValue(mockInvoice);

    const result = await useCase.execute('inv-1', 'admin-user', 'ADMIN');

    expect(result).toEqual(mockInvoice);
  });
});
