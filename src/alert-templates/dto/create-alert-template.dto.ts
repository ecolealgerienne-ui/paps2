import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertCategory } from '../types/alert-category.enum';
import { AlertPriority } from '../types/alert-priority.enum';

export class CreateAlertTemplateDto {
  @ApiProperty({ description: 'Unique code for the template', example: 'vaccination_due' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: 'Name in French', example: 'Vaccination à venir' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameFr: string;

  @ApiProperty({ description: 'Name in English', example: 'Vaccination Due' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameEn: string;

  @ApiProperty({ description: 'Name in Arabic', example: 'التطعيم المستحق' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nameAr: string;

  @ApiPropertyOptional({ description: 'Description in French' })
  @IsString()
  @IsOptional()
  descriptionFr?: string;

  @ApiPropertyOptional({ description: 'Description in English' })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Description in Arabic' })
  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @ApiProperty({ description: 'Alert category', enum: AlertCategory })
  @IsEnum(AlertCategory)
  @IsNotEmpty()
  category: AlertCategory;

  @ApiPropertyOptional({ description: 'Alert priority', enum: AlertPriority, default: AlertPriority.medium })
  @IsEnum(AlertPriority)
  @IsOptional()
  priority?: AlertPriority;

  @ApiPropertyOptional({ description: 'Is the template active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
