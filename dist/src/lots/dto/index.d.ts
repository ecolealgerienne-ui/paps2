import { LotType } from '../../common/enums';
export declare class CreateLotDto {
    id?: string;
    name: string;
    type: LotType;
    description?: string;
    isActive?: boolean;
}
export declare class UpdateLotDto {
    name?: string;
    type?: LotType;
    description?: string;
    isActive?: boolean;
    version?: number;
}
export declare class QueryLotDto {
    type?: LotType;
    isActive?: boolean;
    search?: string;
}
export declare class AddAnimalsToLotDto {
    animalIds: string[];
}
