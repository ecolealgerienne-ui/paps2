import { BreedingMethod, BreedingStatus } from '../../common/enums';
export declare class CreateBreedingDto {
    id?: string;
    motherId: string;
    fatherId?: string;
    fatherName?: string;
    method: BreedingMethod;
    breedingDate: string;
    expectedBirthDate?: string;
    expectedOffspringCount?: number;
    veterinarianId?: string;
    status?: BreedingStatus;
    notes?: string;
}
export declare class UpdateBreedingDto {
    fatherId?: string;
    fatherName?: string;
    method?: BreedingMethod;
    breedingDate?: string;
    expectedBirthDate?: string;
    actualBirthDate?: string;
    expectedOffspringCount?: number;
    offspringIds?: string[];
    veterinarianId?: string;
    status?: BreedingStatus;
    notes?: string;
    version?: number;
}
export declare class QueryBreedingDto {
    motherId?: string;
    fatherId?: string;
    status?: BreedingStatus;
    fromDate?: string;
    toDate?: string;
}
