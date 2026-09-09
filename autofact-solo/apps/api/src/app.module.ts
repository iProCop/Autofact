import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PricingModule } from './pricing/pricing.module';
import { PlatformScoreModule } from './platform-score/platform-score.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PricingModule,
    PlatformScoreModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
