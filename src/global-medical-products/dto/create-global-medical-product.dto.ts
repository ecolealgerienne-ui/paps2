import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MedicalProductType } from '../types/medical-product-type.enum';

export class CreateGlobalMedicalProductDto {
  @ApiProperty({
    description: 'Unique code for the medical product',
    example: 'amoxicilline_500',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiProperty({
    description: 'Name in French',
    example: 'Amoxicilline 500mg',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameFr: string;

  @ApiProperty({
    description: 'Name in English',
    example: 'Amoxicillin 500mg',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({
    description: 'Name in Arabic',
    example: 'أموكسيسيلين 500 ملغ',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameAr: string;

  @ApiProperty({
    description: 'Optional description',
    example: 'Antibiotic for bacterial infections',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type of medical product',
    enum: MedicalProductType,
    example: MedicalProductType.antibiotic,
  })
  @IsEnum(MedicalProductType)
  @IsNotEmpty()
  type: MedicalProductType;

  @ApiProperty({
    description: 'Active principle',
    example: 'Amoxicilline',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  principeActif?: string;

  @ApiProperty({
    description: 'Laboratory/Manufacturer',
    example: 'Pfizer',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  laboratoire?: string;

  @ApiProperty({
    description: 'Marketing Authorization Number (AMM)',
    example: 'FR/V/123456',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  numeroAMM?: string;
}
