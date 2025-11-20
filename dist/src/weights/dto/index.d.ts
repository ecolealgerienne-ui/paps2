import { WeightSource } from '../../common/enums';
export declare class CreateWeightDto {
    id?: string;
    animalId: string;
    weight: number;
    recordedAt: string;
    source?: WeightSource;
    notes?: string;
}
export declare class UpdateWeightDto {
    weight?: number;
    recordedAt?: string;
    source?: WeightSource;
    notes?: string;
    version?: number;
}
export declare class QueryWeightDto {
    animalId?: string;
    source?: WeightSource;
    fromDate?: string;
    toDate?: string;
}
