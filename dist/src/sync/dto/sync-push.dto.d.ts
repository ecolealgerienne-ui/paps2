export declare enum SyncAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete"
}
export declare enum EntityType {
    ANIMAL = "animal",
    LOT = "lot",
    LOT_ANIMAL = "lot_animal",
    TREATMENT = "treatment",
    VACCINATION = "vaccination",
    MOVEMENT = "movement",
    WEIGHT = "weight",
    BREEDING = "breeding",
    CAMPAIGN = "campaign",
    DOCUMENT = "document"
}
export declare class SyncItemDto {
    id: string;
    farmId: string;
    entityType: EntityType;
    entityId: string;
    action: SyncAction;
    payload: Record<string, any>;
    clientTimestamp: string;
    clientVersion?: number;
}
export declare class SyncPushDto {
    items: SyncItemDto[];
}
