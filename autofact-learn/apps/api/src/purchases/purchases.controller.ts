import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

class InitiatePurchaseDto {
  @ApiProperty()
  @IsString()
  reportId!: string;
}

class MockConfirmDto {
  @ApiProperty()
  @IsString()
  paymentId!: string;

  @ApiProperty()
  @IsString()
  reportId!: string;
}

@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchases: PurchasesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT, Role.ADMIN)
  @Post('initiate')
  initiate(@CurrentUser() user: AuthUser, @Body() dto: InitiatePurchaseDto) {
    return this.purchases.initiate(user, dto.reportId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT, Role.ADMIN)
  @Get('history')
  history(@CurrentUser() user: AuthUser) {
    return this.purchases.history(user);
  }

  /** Mock payment success (вместо вебхука YooKassa) */
  @Post('mock/confirm')
  mockConfirm(@Body() dto: MockConfirmDto) {
    return this.purchases.confirmMock(dto.paymentId, dto.reportId);
  }
}
