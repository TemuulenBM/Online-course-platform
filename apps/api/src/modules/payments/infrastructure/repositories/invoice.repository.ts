import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { InvoiceEntity } from '../../domain/entities/invoice.entity';

/**
 * Нэхэмжлэхийн repository.
 * Мэдээллийн сантай харьцах invoice CRUD үйлдлүүд.
 */
@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ нэхэмжлэх үүсгэнэ */
  async create(data: {
    orderId: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
  }): Promise<InvoiceEntity> {
    const invoice = await this.prisma.invoice.create({
      data: {
        orderId: data.orderId,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        currency: data.currency,
      },
      include: {
        order: {
          select: {
            userId: true,
            course: { select: { title: true } },
            user: {
              select: {
                email: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    return this.toEntity(invoice);
  }

  /** ID-аар нэхэмжлэх хайна */
  async findById(id: string): Promise<InvoiceEntity | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            userId: true,
            course: { select: { title: true } },
            user: {
              select: {
                email: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    return invoice ? this.toEntity(invoice) : null;
  }

  /** Захиалгын нэхэмжлэх хайна */
  async findByOrderId(orderId: string): Promise<InvoiceEntity | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            userId: true,
            course: { select: { title: true } },
            user: {
              select: {
                email: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    return invoice ? this.toEntity(invoice) : null;
  }

  /** Хэрэглэгчийн нэхэмжлэхүүд (pagination) */
  async findByUserId(
    userId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: InvoiceEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where = { order: { userId } };
    const skip = (options.page - 1) * options.limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              userId: true,
              course: { select: { title: true } },
              user: {
                select: {
                  email: true,
                  profile: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices.map((i) => this.toEntity(i)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Нэхэмжлэх шинэчлэнэ (PDF URL) */
  async update(id: string, data: { pdfUrl?: string }): Promise<InvoiceEntity> {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data,
      include: {
        order: {
          select: {
            userId: true,
            course: { select: { title: true } },
            user: {
              select: {
                email: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    return this.toEntity(invoice);
  }

  /** Prisma объектийг InvoiceEntity болгож хөрвүүлнэ */
  private toEntity(invoice: any): InvoiceEntity {
    const profile = invoice.order?.user?.profile;
    const userName = profile
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : undefined;

    return new InvoiceEntity({
      id: invoice.id,
      orderId: invoice.orderId,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      pdfUrl: invoice.pdfUrl,
      createdAt: invoice.createdAt,
      courseTitle: invoice.order?.course?.title,
      userName: userName || undefined,
      userEmail: invoice.order?.user?.email,
      orderUserId: invoice.order?.userId,
    });
  }
}
