import { ApiProperty } from '@nestjs/swagger';

export class SyncItemResultDto {
  @ApiProperty({ description: 'Entity ID' })
  entityId: string;

  @ApiProperty({ description: 'Whether sync succeeded for this item' })
  success: boolean;

  @ApiProperty({ description: 'Server version after sync', required: false })
  serverVersion?: number;

  @ApiProperty({ description: 'Error message if failed', required: false })
  error?: string | null;

  // Internal fields used during processing (not sent to client)
  _internalStatus?: 'synced' | 'conflict' | 'failed';
  _internalServerData?: Record<string, any>;
}

export class SyncPushResponseDto {
  @ApiProperty({ description: 'Overall success indicator' })
  success: boolean;

  @ApiProperty({ description: 'Results for each sync item', type: [SyncItemResultDto] })
  results: SyncItemResultDto[];
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
