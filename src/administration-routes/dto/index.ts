import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAdministrationRouteDto {
  @ApiProperty({ description: 'Route ID (e.g., IM, IV, SC, PO)' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Name in French' })
  @IsString()
  nameFr: string;

  @ApiProperty({ description: 'Name in English' })
  @IsString()
  nameEn: string;

  @ApiProperty({ description: 'Name in Arabic' })
  @IsString()
  nameAr: string;

  @ApiProperty({ description: 'Display order', required: false, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateAdministrationRouteDto {
  @ApiProperty({ description: 'Name in French', required: false })
  @IsOptional()
  @IsString()
  nameFr?: string;

  @ApiProperty({ description: 'Name in English', required: false })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ description: 'Name in Arabic', required: false })
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiProperty({ description: 'Display order', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
