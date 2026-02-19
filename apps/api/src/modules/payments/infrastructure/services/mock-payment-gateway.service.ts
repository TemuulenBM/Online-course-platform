import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPaymentGateway } from '../../domain/interfaces/payment-gateway.interface';

/**
 * Mock төлбөрийн gateway.
 * Хөгжүүлэлтийн орчинд ашиглах — бодит төлбөрийн gateway байхгүй үед.
 * Ирээдүйд QPay, SocialPay, Stripe зэрэг gateway-ийн хэрэгжүүлэлтийг
 * IPaymentGateway interface-г дагаж бичээд PAYMENT_GATEWAY DI token-ийг солиход хангалттай.
 */
@Injectable()
export class MockPaymentGateway implements IPaymentGateway {
  private readonly logger = new Logger(MockPaymentGateway.name);

  /** Mock checkout session үүсгэх — бодит redirect байхгүй */
  async createCheckoutSession(params: {
    orderId: string;
    amount: number;
    currency: string;
    courseTitle: string;
    customerEmail: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ sessionId: string; sessionUrl: string | null }> {
    const sessionId = `mock_session_${randomUUID()}`;
    this.logger.log(
      `Mock checkout session үүслээ: ${sessionId}, order=${params.orderId}, amount=${params.amount} ${params.currency}`,
    );
    return { sessionId, sessionUrl: null };
  }

  /** Mock буцаан олголт */
  async createRefund(externalPaymentId: string, amount?: number): Promise<{ refundId: string }> {
    const refundId = `mock_refund_${randomUUID()}`;
    this.logger.log(
      `Mock буцаан олголт: ${refundId}, payment=${externalPaymentId}, amount=${amount ?? 'full'}`,
    );
    return { refundId };
  }
}
