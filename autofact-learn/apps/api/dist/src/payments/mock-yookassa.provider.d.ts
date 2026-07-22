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
export declare class MockYooKassaProvider implements PaymentProvider {
    createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
    confirmMock(paymentId: string): Promise<PaymentResult>;
}
