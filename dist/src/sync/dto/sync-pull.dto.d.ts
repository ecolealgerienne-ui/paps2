import { EntityType } from './sync-push.dto';
export declare class SyncPullQueryDto {
    farmId: string;
    since?: string;
    entityTypes?: EntityType[];
}
