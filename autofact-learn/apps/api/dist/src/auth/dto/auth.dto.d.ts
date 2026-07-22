import { Role } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    role: Role;
    fullName?: string;
    region?: string;
    city?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshDto {
    refreshToken: string;
}
