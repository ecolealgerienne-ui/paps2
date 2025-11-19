import { ApiProperty } from '@nestjs/swagger';

export class SyncItemResultDto {
  @ApiProperty({ description: 'Queue item ID' })
  id: string;

  @ApiProperty({ description: 'Entity ID' })
  entityId: string;

  @ApiProperty({ description: 'Sync status', enum: ['synced', 'conflict', 'failed'] })
  status: 'synced' | 'conflict' | 'failed';

  @ApiProperty({ description: 'New version after sync', required: false })
  newVersion?: number;

  @ApiProperty({ description: 'Server data in case of conflict', required: false })
  serverData?: Record<string, any>;

  @ApiProperty({ description: 'Server version in case of conflict', required: false })
  serverVersion?: number;

  @ApiProperty({ description: 'Error message if failed', required: false })
  errorMessage?: string;
}

export class SyncPushResponseDto {
  @ApiProperty({ description: 'Results for each sync item', type: [SyncItemResultDto] })
  results: SyncItemResultDto[];

  @ApiProperty({ description: 'Server timestamp of this sync' })
  serverTimestamp: string;

  @ApiProperty({ description: 'Summary of sync results' })
  summary: {
    total: number;
    synced: number;
    conflicts: number;
    failed: number;
  };
}

export class SyncChangeDto {
  @ApiProperty({ description: 'Entity type' })
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  entityId: string;

  @ApiProperty({ description: 'Action performed', enum: ['create', 'update', 'delete'] })
  action: 'create' | 'update' | 'delete';

  @ApiProperty({ description: 'Entity data' })
  data: Record<string, any>;

  @ApiProperty({ description: 'Version of the entity' })
  version: number;

  @ApiProperty({ description: 'Timestamp of the change' })
  updatedAt: string;
}

export class SyncPullResponseDto {
  @ApiProperty({ description: 'Changes since last sync', type: [SyncChangeDto] })
  changes: SyncChangeDto[];

  @ApiProperty({ description: 'Server timestamp for next sync' })
  serverTimestamp: string;

  @ApiProperty({ description: 'Whether there are more changes to pull' })
  hasMore: boolean;
}
