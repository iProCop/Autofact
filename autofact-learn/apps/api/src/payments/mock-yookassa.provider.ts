import { Injectable } from '@nestjs/common';

export type CreatePaymentInput = {
  amountKopecks: number;
  description: string;
  metadata: Record<string, string>;
};

export type PaymentResult = {
  paymentId: string;
  status: 'pending' | 'succeeded';
  confirmationUrl: string | null;
};

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  confirmMock(paymentId: string): Promise<PaymentResult>;
}

@Injectable()
export class MockYooKassaProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const paymentId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      paymentId,
      status: 'pending',
      confirmationUrl: `http://localhost:3000/payments/mock?paymentId=${paymentId}&amount=${input.amountKopecks}&reportId=${input.metadata.reportId ?? ""}`,
    };
  }

  async confirmMock(paymentId: string): Promise<PaymentResult> {
    return {
      paymentId,
      status: 'succeeded',
      confirmationUrl: null,
    };
  }
}
