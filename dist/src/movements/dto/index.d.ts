import { MovementType, TemporaryMovementType, BuyerType } from '../../common/enums';
export declare class CreateMovementDto {
    id?: string;
    movementType: MovementType;
    movementDate: string;
    animalIds: string[];
    reason?: string;
    buyerName?: string;
    buyerType?: BuyerType;
    buyerContact?: string;
    salePrice?: number;
    sellerName?: string;
    purchasePrice?: number;
    destinationFarmId?: string;
    originFarmId?: string;
    temporaryType?: TemporaryMovementType;
    expectedReturnDate?: string;
    documentNumber?: string;
    notes?: string;
}
export declare class UpdateMovementDto {
    movementType?: MovementType;
    movementDate?: string;
    reason?: string;
    buyerName?: string;
    buyerType?: BuyerType;
    buyerContact?: string;
    salePrice?: number;
    sellerName?: string;
    purchasePrice?: number;
    documentNumber?: string;
    notes?: string;
    version?: number;
}
export declare class QueryMovementDto {
    movementType?: MovementType;
    status?: string;
    fromDate?: string;
    toDate?: string;
    animalId?: string;
    page?: number;
    limit?: number;
}
