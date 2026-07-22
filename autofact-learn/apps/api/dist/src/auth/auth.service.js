"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    config;
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        if (dto.role === client_1.Role.ADMIN) {
            throw new common_1.BadRequestException('Регистрация ADMIN запрещена');
        }
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing)
            throw new common_1.ConflictException('Email уже занят');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                role: dto.role,
                ...(dto.role === client_1.Role.EXPERT
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Неверный email или пароль');
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Неверный email или пароль');
        return this.buildAuthResponse(user.id, user.email, user.role);
    }
    async refresh(refreshToken) {
        try {
            const payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            });
            return this.buildAuthResponse(payload.sub, payload.email, payload.role);
        }
        catch {
            throw new common_1.UnauthorizedException('Недействительный refresh token');
        }
    }
    async buildAuthResponse(userId, email, role) {
        const accessExpires = this.config.get('JWT_ACCESS_EXPIRES') ?? '15m';
        const refreshExpires = this.config.get('JWT_REFRESH_EXPIRES') ?? '7d';
        const accessToken = await this.jwt.signAsync({ sub: userId, email, role }, {
            secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
            expiresIn: accessExpires,
        });
        const refreshToken = await this.jwt.signAsync({ sub: userId, email, role }, {
            secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            expiresIn: refreshExpires,
        });
        return { accessToken, refreshToken, user: { id: userId, email, role } };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map