import { Test, TestingModule } from '@nestjs/testing';
import { MockPaymentGateway } from '../../infrastructure/services/mock-payment-gateway.service';

describe('MockPaymentGateway', () => {
  let gateway: MockPaymentGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockPaymentGateway],
    }).compile();

    gateway = module.get<MockPaymentGateway>(MockPaymentGateway);
  });

  it('createCheckoutSession — mock session ID болон null URL буцаах', async () => {
    const result = await gateway.createCheckoutSession({
      orderId: 'order-1',
      amount: 50000,
      currency: 'MNT',
      courseTitle: 'Test Course',
      customerEmail: 'john@example.com',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
    });

    expect(result.sessionId).toBeDefined();
    expect(result.sessionId).toContain('mock_session_');
    expect(result.sessionUrl).toBeNull();
  });

  it('createRefund — mock refund ID буцаах', async () => {
    const result = await gateway.createRefund('ext-payment-1', 25000);

    expect(result.refundId).toBeDefined();
    expect(result.refundId).toContain('mock_refund_');
  });

  it('createRefund — дүн заагаагүй бол бүтэн буцаан олголт', async () => {
    const result = await gateway.createRefund('ext-payment-1');

    expect(result.refundId).toBeDefined();
    expect(result.refundId).toContain('mock_refund_');
  });
});
