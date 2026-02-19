import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import { SubscriptionStatus, PlanType, Prisma } from '@prisma/client';

/**
 * Бүртгэлийн repository.
 * Мэдээллийн сантай харьцах subscription CRUD үйлдлүүд.
 */
@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Шинэ бүртгэл үүсгэнэ */
  async create(data: {
    userId: string;
    planType: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    externalSubscriptionId?: string;
  }): Promise<SubscriptionEntity> {
    const subscription = await this.prisma.subscription.create({
      data: {
        userId: data.userId,
        planType: data.planType.toUpperCase() as PlanType,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        externalSubscriptionId: data.externalSubscriptionId,
      },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return this.toEntity(subscription);
  }

  /** ID-аар бүртгэл хайна */
  async findById(id: string): Promise<SubscriptionEntity | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return subscription ? this.toEntity(subscription) : null;
  }

  /** Хэрэглэгчийн идэвхтэй бүртгэл хайна */
  async findActiveByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return subscription ? this.toEntity(subscription) : null;
  }

  /** External subscription ID-аар хайна */
  async findByExternalId(externalSubscriptionId: string): Promise<SubscriptionEntity | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { externalSubscriptionId },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return subscription ? this.toEntity(subscription) : null;
  }

  /** Бүртгэл шинэчлэнэ */
  async update(
    id: string,
    data: Partial<{
      status: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      cancelledAt: Date | null;
    }>,
  ): Promise<SubscriptionEntity> {
    const updateData: Prisma.SubscriptionUpdateInput = {};

    if (data.status !== undefined)
      updateData.status = data.status.toUpperCase() as SubscriptionStatus;
    if (data.currentPeriodStart !== undefined)
      updateData.currentPeriodStart = data.currentPeriodStart;
    if (data.currentPeriodEnd !== undefined) updateData.currentPeriodEnd = data.currentPeriodEnd;
    if (data.cancelAtPeriodEnd !== undefined) updateData.cancelAtPeriodEnd = data.cancelAtPeriodEnd;
    if (data.cancelledAt !== undefined) updateData.cancelledAt = data.cancelledAt;

    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return this.toEntity(subscription);
  }

  /** Бүртгэл устгана */
  async delete(id: string): Promise<void> {
    await this.prisma.subscription.delete({ where: { id } });
  }

  /** Prisma объектийг SubscriptionEntity болгож хөрвүүлнэ */
  private toEntity(subscription: any): SubscriptionEntity {
    const profile = subscription.user?.profile;
    const userName = profile
      ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      : undefined;

    return new SubscriptionEntity({
      id: subscription.id,
      userId: subscription.userId,
      planType: subscription.planType,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      externalSubscriptionId: subscription.externalSubscriptionId,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      cancelledAt: subscription.cancelledAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      userName: userName || undefined,
      userEmail: subscription.user?.email,
    });
  }
}
