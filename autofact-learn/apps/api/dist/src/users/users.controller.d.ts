import { UsersService } from './users.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    me(user: AuthUser): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        expert: {
            id: string;
            fullName: string;
            region: string;
            city: string;
            bio: string;
            avatarUrl: string | null;
            specializations: string[];
            rating: import("@prisma/client/runtime/library").Decimal;
            inspectionsCount: number;
            salesCount: number;
            payoutDetails: string | null;
            balanceKopecks: number;
            userId: string;
        } | null;
        client: {
            id: string;
            userId: string;
            subscriptionLevel: import("@prisma/client").$Enums.SubscriptionLevel;
            subscriptionEndsAt: Date | null;
        } | null;
    }>;
    experts(region?: string): Promise<{
        id: string;
        fullName: string;
        region: string;
        city: string;
        bio: string;
        avatarUrl: string | null;
        specializations: string[];
        rating: import("@prisma/client/runtime/library").Decimal;
        inspectionsCount: number;
        salesCount: number;
    }[]>;
}
