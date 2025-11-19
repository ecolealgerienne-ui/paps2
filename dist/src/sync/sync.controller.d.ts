import { SyncService } from './sync.service';
import { SyncPushDto, SyncPullQueryDto } from './dto';
import { SyncPushResponseDto, SyncPullResponseDto } from './dto/sync-response.dto';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    pushChanges(dto: SyncPushDto): Promise<SyncPushResponseDto>;
    pullChanges(query: SyncPullQueryDto): Promise<SyncPullResponseDto>;
}
