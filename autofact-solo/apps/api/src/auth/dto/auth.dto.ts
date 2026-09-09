import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty()
    @IsEmail()
    email!: string;

    @ApiProperty({ minLength: 8 })
    @IsString()
    @MinLength(8)
    password!: string;


    @ApiProperty({ enum: Role, example: 'CLIENT' })
    @IsEnum(Role)
    role!: Role;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    region?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    city?: string;
}

export class LoginDto {
    @ApiProperty()
    @IsEmail()
    email!: string;

    @ApiProperty()
    @IsString()
    password!: string;
}

export class RefreshDto {
    @ApiProperty()
    @IsString()
    refreshToken!: string;
}