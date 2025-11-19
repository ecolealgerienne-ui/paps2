import { BreedingMethod, BreedingStatus } from '../../common/enums';
export declare class CreateBreedingDto {
    id?: string;
    femaleId: string;
    maleId?: string;
    method: BreedingMethod;
    breedingDate: string;
    expectedDueDate?: string;
    status?: BreedingStatus;
    notes?: string;
}
export declare class UpdateBreedingDto {
    maleId?: string;
    method?: BreedingMethod;
    breedingDate?: string;
    expectedDueDate?: string;
    actualDueDate?: string;
    status?: BreedingStatus;
    offspringId?: string;
    offspringCount?: number;
    notes?: string;
    version?: number;
}
export declare class QueryBreedingDto {
    femaleId?: string;
    status?: BreedingStatus;
    fromDate?: string;
    toDate?: string;
}
