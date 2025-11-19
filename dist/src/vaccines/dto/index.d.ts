export declare class CreateVaccineDto {
    name: string;
    disease: string;
    speciesId?: string;
    manufacturer?: string;
    dosagePerAnimal?: number;
    dosageUnit?: string;
    boosterRequired?: boolean;
    boosterIntervalDays?: number;
    isActive?: boolean;
}
export declare class UpdateVaccineDto {
    name?: string;
    disease?: string;
    speciesId?: string;
    manufacturer?: string;
    dosagePerAnimal?: number;
    dosageUnit?: string;
    boosterRequired?: boolean;
    boosterIntervalDays?: number;
    isActive?: boolean;
}
export declare class QueryVaccineDto {
    search?: string;
    speciesId?: string;
    disease?: string;
    isActive?: boolean;
}
