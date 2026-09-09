import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const users = await this.prisma.user.count();
    return {
      ok: true,
      service: 'autofact-solo-api',
      database: 'up',
      usersCount: users,
      timestamp: new Date().toISOString(),
    };
  }
}