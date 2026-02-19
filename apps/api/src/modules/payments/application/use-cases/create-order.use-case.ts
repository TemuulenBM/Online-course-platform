import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { CourseRepository } from '../../../courses/infrastructure/repositories/course.repository';
import { EnrollmentRepository } from '../../../enrollments/infrastructure/repositories/enrollment.repository';
import {
  IPaymentGateway,
  PAYMENT_GATEWAY,
} from '../../domain/interfaces/payment-gateway.interface';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { OrderEntity } from '../../domain/entities/order.entity';

/**
 * Захиалга үүсгэх use case.
 * Сургалтын байдал, элсэлт, давхар захиалга зэргийг шалгаж шинэ захиалга үүсгэнэ.
 */
@Injectable()
export class CreateOrderUseCase {
  private readonly logger = new Logger(CreateOrderUseCase.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    private readonly configService: ConfigService,
  ) {}

  async execute(userId: string, userEmail: string, dto: CreateOrderDto): Promise<OrderEntity> {
    /** 1. Сургалт олдох эсэх шалгах */
    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException('Сургалт олдсонгүй');
    }

    /** 2. Сургалт PUBLISHED эсэх шалгах */
    if (course.status !== 'published') {
      throw new BadRequestException('Зөвхөн нийтлэгдсэн сургалтад захиалга үүсгэх боломжтой');
    }

    /** 3. Үнэгүй сургалт эсэх шалгах */
    if (course.price == null || course.price === 0) {
      throw new BadRequestException('Үнэгүй сургалтад /enrollments endpoint ашиглана уу');
    }

    /** 4. ACTIVE элсэлт байгаа эсэх шалгах */
    const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, dto.courseId);
    if (enrollment && (enrollment.status === 'active' || enrollment.status === 'completed')) {
      throw new ConflictException('Та энэ сургалтад аль хэдийн элссэн байна');
    }

    /** 5. PENDING/PROCESSING/PAID захиалга байгаа эсэх шалгах */
    const existingOrder = await this.orderRepository.findByUserAndCourse(userId, dto.courseId);
    if (existingOrder) {
      throw new ConflictException('Энэ сургалтад захиалга аль хэдийн байна');
    }

    /** 6. Үнэ тодорхойлох — хямдралтай үнэ байвал түүнийг ашиглана */
    const amount =
      course.discountPrice != null && course.discountPrice > 0
        ? course.discountPrice
        : course.price;

    /** 7. Валют тодорхойлох */
    const currency = this.configService.get<string>('stripe.currency') || 'MNT';

    /** 8. Захиалга үүсгэх (PENDING статустай) */
    const order = await this.orderRepository.create({
      userId,
      courseId: dto.courseId,
      amount,
      currency,
      paymentMethod: dto.paymentMethod,
    });

    /** 9. Checkout session үүсгэх (ирээдүйд ашиглах) */
    try {
      const session = await this.paymentGateway.createCheckoutSession({
        orderId: order.id,
        amount,
        currency,
        courseTitle: course.title,
        customerEmail: userEmail,
      });

      /** External payment ID шинэчлэх */
      if (session.sessionId) {
        await this.orderRepository.update(order.id, {
          externalPaymentId: session.sessionId,
        });
      }
    } catch (error) {
      /** Gateway алдааг алгасна — захиалга үүссэн байдлаараа байна */
      this.logger.warn(
        `Payment gateway session үүсгэхэд алдаа: ${error instanceof Error ? error.message : error}`,
      );
    }

    this.logger.log(
      `Захиалга үүслээ: ${order.id} — хэрэглэгч: ${userId}, сургалт: ${dto.courseId}, дүн: ${amount} ${currency}`,
    );

    return order;
  }
}
