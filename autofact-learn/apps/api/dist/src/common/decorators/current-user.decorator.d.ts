export declare class AuthUser {
    userId: string;
    email: string;
    role: 'CLIENT' | 'EXPERT' | 'ADMIN';
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
