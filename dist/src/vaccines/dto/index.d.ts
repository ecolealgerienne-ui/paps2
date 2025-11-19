export declare class CreateVaccineDto {
    name: string;
    description?: string;
    manufacturer?: string;
    targetSpecies?: string[];
    targetDiseases?: string[];
    standardDose?: number;
    injectionsRequired?: number;
    injectionIntervalDays?: number;
    meatWithdrawalDays?: number;
    milkWithdrawalDays?: number;
    administrationRoute?: string;
    isActive?: boolean;
}
export declare class UpdateVaccineDto {
    name?: string;
    description?: string;
    manufacturer?: string;
    targetSpecies?: string[];
    targetDiseases?: string[];
    standardDose?: number;
    injectionsRequired?: number;
    injectionIntervalDays?: number;
    meatWithdrawalDays?: number;
    milkWithdrawalDays?: number;
    administrationRoute?: string;
    isActive?: boolean;
}
export declare class QueryVaccineDto {
    search?: string;
    isActive?: boolean;
}
