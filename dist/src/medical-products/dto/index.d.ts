export declare class CreateMedicalProductDto {
    name: string;
    activeSubstance?: string;
    manufacturer?: string;
    withdrawalPeriodMeat?: number;
    withdrawalPeriodMilk?: number;
    dosageUnit?: string;
    isActive?: boolean;
}
export declare class UpdateMedicalProductDto {
    name?: string;
    activeSubstance?: string;
    manufacturer?: string;
    withdrawalPeriodMeat?: number;
    withdrawalPeriodMilk?: number;
    dosageUnit?: string;
    isActive?: boolean;
}
export declare class QueryMedicalProductDto {
    search?: string;
    isActive?: boolean;
}
