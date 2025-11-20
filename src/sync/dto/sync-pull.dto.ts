import { IsString, IsDateString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from './sync-push.dto';

export class SyncPullQueryDto {
  @ApiProperty({ description: 'Farm ID' })
  @IsString()
  farmId: string;

  @ApiProperty({ description: 'Last sync timestamp', required: false })
  @IsOptional()
  @IsDateString()
  since?: string;

  @ApiProperty({
    enum: EntityType,
    isArray: true,
    description: 'Entity types to pull (all if not specified)',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EntityType, { each: true })
  entityTypes?: EntityType[];
}
