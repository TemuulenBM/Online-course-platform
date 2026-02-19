/**
 * Төлбөрийн gateway interface.
 * Stripe, QPay, SocialPay зэрэг хэрэгжүүлэлтүүд энэ interface-г дагана.
 * Одоогоор MockPaymentGateway ашиглагдаж байгаа бөгөөд
 * ирээдүйд бодит gateway руу хялбар солих боломжтой.
 */
export interface IPaymentGateway {
  /** Checkout session үүсгэх */
  createCheckoutSession(params: {
    orderId: string;
    amount: number;
    currency: string;
    courseTitle: string;
    customerEmail: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ sessionId: string; sessionUrl: string | null }>;

  /** Буцаан олголт хийх */
  createRefund(externalPaymentId: string, amount?: number): Promise<{ refundId: string }>;

  /** Webhook event баталгаажуулах (optional — бодит gateway-д) */
  verifyWebhookSignature?(rawBody: Buffer, signature: string): unknown;

  /** Subscription session үүсгэх (optional — бодит gateway-д) */
  createSubscriptionSession?(params: {
    userId: string;
    planType: string;
    customerEmail: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<{ sessionId: string; sessionUrl: string | null }>;

  /** Subscription цуцлах (optional — бодит gateway-д) */
  cancelSubscription?(externalSubscriptionId: string): Promise<void>;
}

/** NestJS DI token */
export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';
