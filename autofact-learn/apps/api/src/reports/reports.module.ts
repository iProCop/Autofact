import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PricingModule } from '../pricing/pricing.module';
import { PlatformScoreModule } from '../platform-score/platform-score.module';

@Module({
  imports: [PricingModule, PlatformScoreModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
