import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PricingModule } from './pricing/pricing.module';
import { PlatformScoreModule } from './platform-score/platform-score.module';
import { ReportsModule } from './reports/reports.module';
import { PurchasesModule } from './purchases/purchases.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PricingModule,
    PlatformScoreModule,
    ReportsModule,
    PurchasesModule,
    PaymentsModule,
  ],
})
export class AppModule {}
