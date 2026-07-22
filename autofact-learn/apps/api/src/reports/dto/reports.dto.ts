import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DefectDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ description: 'side | top | rear | interior' })
  @IsString()
  view!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  x!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  y!: number;

  @ApiProperty({ description: 'scratch | dent | rust | chip | crack | replace | other' })
  @IsString()
  type!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  severity!: number;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;
}

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

  @ApiProperty({ description: 'Техника / техосмотр 1–10' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  engineScore!: number;

  @ApiProperty({ description: 'Кузов 1–10' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  bodyScore!: number;

  @ApiProperty({ description: 'ЛКП 1–10' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  paintScore!: number;

  @ApiProperty({ description: 'Салон 1–10' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  interiorScore!: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  tiresScore?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  electricsScore?: number;

  @ApiPropertyOptional({ type: [DefectDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefectDto)
  defects?: DefectDto[];

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
