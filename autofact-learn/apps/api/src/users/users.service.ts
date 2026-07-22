import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expert: true,
        client: true,
      },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async listExperts(region?: string) {
    return this.prisma.expertProfile.findMany({
      where: region ? { region: { contains: region, mode: 'insensitive' } } : undefined,
      orderBy: { rating: 'desc' },
      take: 50,
      select: {
        id: true,
        fullName: true,
        region: true,
        city: true,
        bio: true,
        rating: true,
        inspectionsCount: true,
        salesCount: true,
        specializations: true,
        avatarUrl: true,
      },
    });
  }
}
