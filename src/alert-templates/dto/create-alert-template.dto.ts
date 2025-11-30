import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { AlertCategory, AlertPriority } from '@prisma/client';

export class CreateAlertTemplateDto {
  @ApiProperty({
    description: 'Unique code for the alert template',
    example: 'vaccination_due',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Code must contain only lowercase letters, numbers, and underscores',
  })
  code: string;

  @ApiProperty({
    description: 'French name',
    example: 'Vaccination à venir',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameFr: string;

  @ApiProperty({
    description: 'English name',
    example: 'Vaccination Due',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({
    description: 'Arabic name',
    example: 'التطعيم المستحق',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameAr: string;

  @ApiPropertyOptional({
    description: 'French description',
    example: 'Alerte pour rappel de vaccination',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descriptionFr?: string;

  @ApiPropertyOptional({
    description: 'English description',
    example: 'Alert for vaccination reminder',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descriptionEn?: string;

  @ApiPropertyOptional({
    description: 'Arabic description',
    example: 'تنبيه لتذكير التطعيم',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  descriptionAr?: string;

  @ApiProperty({
    description: 'Alert category',
    enum: AlertCategory,
    example: AlertCategory.vaccination,
  })
  @IsEnum(AlertCategory)
  category: AlertCategory;

  @ApiPropertyOptional({
    description: 'Alert priority',
    enum: AlertPriority,
    example: AlertPriority.medium,
    default: AlertPriority.medium,
  })
  @IsEnum(AlertPriority)
  @IsOptional()
  priority?: AlertPriority;

  @ApiPropertyOptional({
    description: 'Whether the template is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
