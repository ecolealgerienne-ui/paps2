import { IsString, IsEnum, IsObject, IsDateString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SyncAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum EntityType {
  ANIMAL = 'animal',
  LOT = 'lot',
  LOT_ANIMAL = 'lot_animal',
  TREATMENT = 'treatment',
  VACCINATION = 'vaccination',
  MOVEMENT = 'movement',
  WEIGHT = 'weight',
  BREEDING = 'breeding',
  CAMPAIGN = 'campaign',
  DOCUMENT = 'document',
}

export class SyncItemDto {
  @ApiProperty({ description: 'Unique ID for this queue item' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Farm ID' })
  @IsString()
  farmId: string;

  @ApiProperty({ enum: EntityType, description: 'Type of entity being synced' })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ description: 'ID of the entity' })
  @IsString()
  entityId: string;

  @ApiProperty({ enum: SyncAction, description: 'Action to perform' })
  @IsEnum(SyncAction)
  action: SyncAction;

  @ApiProperty({ description: 'Entity data payload' })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({ description: 'Client timestamp when change was made' })
  @IsDateString()
  clientTimestamp: string;

  @ApiProperty({ description: 'Client version of the entity', required: false })
  @IsOptional()
  clientVersion?: number;
}

export class SyncPushDto {
  @ApiProperty({ type: [SyncItemDto], description: 'Items to sync' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncItemDto)
  items: SyncItemDto[];
}
