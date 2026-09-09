import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role === Role.ADMIN) {
      throw new BadRequestException('Регистрация ADMIN запрещена');
    }

    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email уже занят');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: dto.role,
        ...(dto.role === Role.EXPERT
          ? {
              expert: {
                create: {
                  fullName: dto.fullName ?? 'Эксперт',
                  region: dto.region ?? 'Москва',
                  city: dto.city ?? 'Москва',
                  specializations: ['общая диагностика'],
                },
              },
            }
          : {
              client: {
                create: {},
              },
            }),
      },
      include: { expert: true, client: true },
    });

    return this.buildAuthResponse(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.buildAuthResponse(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        email: string;
        role: Role;
      }>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      return this.buildAuthResponse(payload.sub, payload.email, payload.role);
    } catch {
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  private async buildAuthResponse(
    userId: string,
    email: string,
    role: Role,
  ) {
    const accessExpires =
      this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
    const refreshExpires =
      this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';

    const payload = { sub: userId, email, role };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpires,
    } as Parameters<JwtService['signAsync']>[1]);

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpires,
    } as Parameters<JwtService['signAsync']>[1]);

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role },
    };
  }
}
