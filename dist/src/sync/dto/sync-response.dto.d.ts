export declare class SyncItemResultDto {
    entityId: string;
    success: boolean;
    serverVersion?: number;
    error?: string | null;
    _internalStatus?: 'synced' | 'conflict' | 'failed';
    _internalServerData?: Record<string, any>;
}
export declare class SyncPushResponseDto {
    success: boolean;
    results: SyncItemResultDto[];
}
export declare class SyncChangeDto {
    entityType: string;
    entityId: string;
    action: 'create' | 'update' | 'delete';
    data: Record<string, any>;
    version: number;
    updatedAt: string;
}
export declare class SyncPullResponseDto {
    changes: SyncChangeDto[];
    serverTimestamp: string;
    hasMore: boolean;
}
