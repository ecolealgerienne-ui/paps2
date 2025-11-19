import { PrismaService } from '../prisma/prisma.service';
import { SyncPushDto, SyncPullQueryDto } from './dto';
import { SyncPushResponseDto, SyncPullResponseDto } from './dto/sync-response.dto';
export declare class SyncService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    pushChanges(dto: SyncPushDto): Promise<SyncPushResponseDto>;
    private processItem;
    private handleCreate;
    private handleUpdate;
    private handleDelete;
    pullChanges(query: SyncPullQueryDto): Promise<SyncPullResponseDto>;
    private buildFarmWhereClause;
    private getModelName;
}
