export declare class SyncItemResultDto {
    id: string;
    entityId: string;
    status: 'synced' | 'conflict' | 'failed';
    newVersion?: number;
    serverData?: Record<string, any>;
    serverVersion?: number;
    errorMessage?: string;
}
export declare class SyncPushResponseDto {
    results: SyncItemResultDto[];
    serverTimestamp: string;
    summary: {
        total: number;
        synced: number;
        conflicts: number;
        failed: number;
    };
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
