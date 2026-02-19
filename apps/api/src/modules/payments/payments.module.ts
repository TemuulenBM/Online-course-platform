import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { NotificationsModule } from '../notifications/notifications.module';

// Controllers
import { OrdersController } from './interface/controllers/orders.controller';
import { SubscriptionsController } from './interface/controllers/subscriptions.controller';
import { InvoicesController } from './interface/controllers/invoices.controller';

// Use Cases — Orders
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { UploadPaymentProofUseCase } from './application/use-cases/upload-payment-proof.use-case';
import { ApproveOrderUseCase } from './application/use-cases/approve-order.use-case';
import { RejectOrderUseCase } from './application/use-cases/reject-order.use-case';
import { ListMyOrdersUseCase } from './application/use-cases/list-my-orders.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';
import { ListPendingOrdersUseCase } from './application/use-cases/list-pending-orders.use-case';

// Use Cases — Subscriptions
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { GetMySubscriptionUseCase } from './application/use-cases/get-my-subscription.use-case';

// Use Cases — Invoices
import { ListMyInvoicesUseCase } from './application/use-cases/list-my-invoices.use-case';
import { GetInvoiceUseCase } from './application/use-cases/get-invoice.use-case';

// Infrastructure
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { SubscriptionRepository } from './infrastructure/repositories/subscription.repository';
import { InvoiceRepository } from './infrastructure/repositories/invoice.repository';
import { MockPaymentGateway } from './infrastructure/services/mock-payment-gateway.service';
import { PaymentCacheService } from './infrastructure/services/payment-cache.service';
import { PaymentProcessor } from './infrastructure/services/payment.processor';
import { InvoicePdfService } from './infrastructure/services/invoice-pdf.service';

// Domain
import { PAYMENT_GATEWAY } from './domain/interfaces/payment-gateway.interface';

// Storage (Content модулийн pattern дахин ашиглах)
import { STORAGE_SERVICE } from '../content/infrastructure/services/storage/storage.interface';
import { LocalStorageService } from '../content/infrastructure/services/storage/local-storage.service';

/**
 * Payments модуль.
 * Захиалга үүсгэх, гар аргаар баталгаажуулах (банк шилжүүлэг → admin approve),
 * нэхэмжлэх PDF үүсгэх, Bull Queue-ээр enrollment + invoice автомат үүсгэх.
 * IPaymentGateway DI Token-ийг ирээдүйд QPay/Stripe руу солих боломжтой.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: 'payments' }),
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
    ConfigModule,
    CoursesModule,
    EnrollmentsModule,
    NotificationsModule,
  ],
  controllers: [OrdersController, SubscriptionsController, InvoicesController],
  providers: [
    // Use Cases — Orders
    CreateOrderUseCase,
    UploadPaymentProofUseCase,
    ApproveOrderUseCase,
    RejectOrderUseCase,
    ListMyOrdersUseCase,
    GetOrderUseCase,
    ListPendingOrdersUseCase,
    // Use Cases — Subscriptions
    CreateSubscriptionUseCase,
    CancelSubscriptionUseCase,
    GetMySubscriptionUseCase,
    // Use Cases — Invoices
    ListMyInvoicesUseCase,
    GetInvoiceUseCase,
    // Infrastructure
    OrderRepository,
    SubscriptionRepository,
    InvoiceRepository,
    PaymentCacheService,
    PaymentProcessor,
    InvoicePdfService,
    // DI Tokens — ирээдүйд бодит gateway руу солих боломжтой
    { provide: PAYMENT_GATEWAY, useClass: MockPaymentGateway },
    { provide: STORAGE_SERVICE, useClass: LocalStorageService },
  ],
  exports: [OrderRepository],
})
export class PaymentsModule {}
