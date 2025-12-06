import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for adding an alert template preference to a farm
 * Note: farmId is obtained from URL path parameter, not from body
 */
export class AddFarmAlertTemplatePreferenceDto {
  @ApiProperty({
    description: 'Alert Template ID (UUID)',
    example: '987fcdeb-51a2-43f7-b890-123456789abc',
  })
  @IsString()
  @IsNotEmpty()
  alertTemplateId: string;

  @ApiPropertyOptional({
    description: 'Custom reminder days (overrides default from template)',
    example: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reminderDays?: number;
}
