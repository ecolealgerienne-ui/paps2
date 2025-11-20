import { PrismaService } from '../prisma/prisma.service';
import { SyncPushDto, SyncPullQueryDto } from './dto';
import { SyncPushResponseDto, SyncPullResponseDto } from './dto/sync-response.dto';
import { PayloadNormalizerService } from './payload-normalizer.service';
export declare class SyncService {
    private prisma;
    private normalizer;
    private readonly logger;
    constructor(prisma: PrismaService, normalizer: PayloadNormalizerService);
    pushChanges(dto: SyncPushDto): Promise<SyncPushResponseDto>;
    private processItem;
    private handleCreate;
    private handleUpdate;
    private handleDelete;
    pullChanges(query: SyncPullQueryDto): Promise<SyncPullResponseDto>;
    private getModelName;
}
