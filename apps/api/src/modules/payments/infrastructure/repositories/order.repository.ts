import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrderStatus, Prisma } from '@prisma/client';

/**
 * Захиалгын repository.
 * Мэдээллийн сантай харьцах захиалгын CRUD үйлдлүүд.
 */
@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ захиалга үүсгэнэ */
  async create(data: {
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
  }): Promise<OrderEntity> {
    const order = await this.prisma.order.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            price: true,
            instructorId: true,
          },
        },
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
    });

    return this.toEntity(order);
  }

  /** ID-аар захиалга хайна */
  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            price: true,
            instructorId: true,
          },
        },
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
    });

    return order ? this.toEntity(order) : null;
  }

  /** External payment ID-аар хайна (ирээдүйн webhook-д) */
  async findByExternalPaymentId(externalPaymentId: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { externalPaymentId },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            price: true,
            instructorId: true,
          },
        },
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
    });

    return order ? this.toEntity(order) : null;
  }

  /** Хэрэглэгч + сургалт-аар захиалга хайна */
  async findByUserAndCourse(userId: string, courseId: string): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        courseId,
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.PAID] },
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            price: true,
            instructorId: true,
          },
        },
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
    });

    return order ? this.toEntity(order) : null;
  }

  /** Хэрэглэгчийн захиалгууд (pagination + status шүүлтүүр) */
  async findByUserId(
    userId: string,
    options: { page: number; limit: number; status?: string },
  ): Promise<{
    data: OrderEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Prisma.OrderWhereInput = { userId };
    if (options.status) where.status = options.status.toUpperCase() as OrderStatus;

    const skip = (options.page - 1) * options.limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { title: true, slug: true } },
          invoice: { select: { id: true, invoiceNumber: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.toEntity(o)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Сургалтын захиалгууд (TEACHER/ADMIN) */
  async findByCourseId(
    courseId: string,
    options: { page: number; limit: number },
  ): Promise<{
    data: OrderEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Prisma.OrderWhereInput = { courseId };
    const skip = (options.page - 1) * options.limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          invoice: { select: { id: true, invoiceNumber: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.toEntity(o)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Баталгаажуулах хүлээж буй захиалгууд (ADMIN) */
  async findPendingOrders(options: { page: number; limit: number }): Promise<{
    data: OrderEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: Prisma.OrderWhereInput = {
      status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
    };
    const skip = (options.page - 1) * options.limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: options.limit,
        orderBy: { createdAt: 'asc' },
        include: {
          course: { select: { title: true, slug: true } },
          user: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.toEntity(o)),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  /** Захиалга шинэчлэнэ */
  async update(
    id: string,
    data: Partial<{
      status: string;
      paymentMethod: string;
      externalPaymentId: string;
      proofImageUrl: string;
      adminNote: string;
      metadata: Record<string, unknown>;
      paidAt: Date | null;
    }>,
  ): Promise<OrderEntity> {
    const updateData: Prisma.OrderUpdateInput = {};

    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as OrderStatus;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.externalPaymentId !== undefined) updateData.externalPaymentId = data.externalPaymentId;
    if (data.proofImageUrl !== undefined) updateData.proofImageUrl = data.proofImageUrl;
    if (data.adminNote !== undefined) updateData.adminNote = data.adminNote;
    if (data.metadata !== undefined) updateData.metadata = data.metadata as any;
    if (data.paidAt !== undefined) updateData.paidAt = data.paidAt;

    const order = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            price: true,
            instructorId: true,
          },
        },
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
    });

    return this.toEntity(order);
  }

  /** Захиалга устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }

  /** Prisma объектийг OrderEntity болгож хөрвүүлнэ */
  private toEntity(order: any): OrderEntity {
    const profile = order.user?.profile;
    const userName = profile
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : undefined;

    return new OrderEntity({
      id: order.id,
      userId: order.userId,
      courseId: order.courseId,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      paymentMethod: order.paymentMethod,
      externalPaymentId: order.externalPaymentId,
      proofImageUrl: order.proofImageUrl,
      adminNote: order.adminNote,
      metadata: order.metadata as Record<string, unknown> | null,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      userName: userName || undefined,
      userEmail: order.user?.email,
      courseTitle: order.course?.title,
      courseSlug: order.course?.slug,
      coursePrice: order.course?.price,
      courseInstructorId: order.course?.instructorId,
      invoiceId: order.invoice?.id,
      invoiceNumber: order.invoice?.invoiceNumber,
    });
  }
}
