import { LotType } from '../../common/enums';
export declare class CreateLotDto {
    id?: string;
    name: string;
    type?: LotType;
    status?: string;
    productId?: string;
    productName?: string;
    treatmentDate?: string;
    withdrawalEndDate?: string;
    veterinarianId?: string;
    veterinarianName?: string;
    priceTotal?: number;
    buyerName?: string;
    sellerName?: string;
    description?: string;
    notes?: string;
    isActive?: boolean;
}
export declare class UpdateLotDto {
    name?: string;
    type?: LotType;
    status?: string;
    productId?: string;
    productName?: string;
    treatmentDate?: string;
    withdrawalEndDate?: string;
    veterinarianId?: string;
    veterinarianName?: string;
    priceTotal?: number;
    buyerName?: string;
    sellerName?: string;
    description?: string;
    notes?: string;
    isActive?: boolean;
    completed?: boolean;
    version?: number;
}
export declare class QueryLotDto {
    type?: LotType;
    status?: string;
    completed?: boolean;
    isActive?: boolean;
    search?: string;
}
export declare class AddAnimalsToLotDto {
    animalIds: string[];
}
