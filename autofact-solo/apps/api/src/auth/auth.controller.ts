import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly auth:AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }

    @Post('refresh')
    refresh(@Body() dto: RefreshDto) {
        return this.auth.refresh(dto.refreshToken);
    }

    @Post('logout')
    logout() {
        return { ok: true };
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('me')
    me(@CurrentUser() user: AuthUser) {
      return user;
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.EXPERT)
    @Get('expert-only')
    expertOnly(@CurrentUser() user: AuthUser) {
    return { ok: true, message: 'Ты эксперт', user };
  }
}