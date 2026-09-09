import {
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
    @ApiProperty()
    @IsString()
    @MinLength(2)
    title!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    summary?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    expertNotes?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    vin?: string;

    @ApiProperty()
    @IsString()
    make!: string;

    @ApiProperty()
    @IsString()
    model!: string;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1980)
    year!: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    mileage!: number;

    @ApiProperty({ description: 'Техника 1-10' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    engineScore!: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    bodyScore!: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    paintScore!: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    interiorScore!: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    tiresScore?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    electricsScore?: number;

    @ApiProperty({ description: 'Базовая цена в копейках' })
    @Type(() => Number)
    @IsInt()
    @Min(100)
    basePriceKopecks!: number;

    @ApiProperty()
    @IsString()
    region!: string;

    @ApiProperty()
    @IsString()
    city!: string;
}

export class ListReportsQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    make?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    model?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    region?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;
  
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 12;
}