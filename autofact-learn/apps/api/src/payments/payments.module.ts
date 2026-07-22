import { Module } from '@nestjs/common';
import { MockYooKassaProvider } from './mock-yookassa.provider';

@Module({
  providers: [MockYooKassaProvider],
  exports: [MockYooKassaProvider],
})
export class PaymentsModule {}
