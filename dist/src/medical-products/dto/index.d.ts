export declare class CreateMedicalProductDto {
    name: string;
    commercialName?: string;
    category?: string;
    activeIngredient?: string;
    manufacturer?: string;
    dosage?: number;
    withdrawalPeriodMeat?: number;
    withdrawalPeriodMilk?: number;
    currentStock?: number;
    minStock?: number;
    unitPrice?: number;
    batchNumber?: string;
    expiryDate?: string;
    prescription?: string;
    type?: string;
    targetSpecies?: string;
    isActive?: boolean;
}
export declare class UpdateMedicalProductDto {
    name?: string;
    commercialName?: string;
    category?: string;
    activeIngredient?: string;
    manufacturer?: string;
    dosage?: number;
    withdrawalPeriodMeat?: number;
    withdrawalPeriodMilk?: number;
    currentStock?: number;
    minStock?: number;
    unitPrice?: number;
    batchNumber?: string;
    expiryDate?: string;
    prescription?: string;
    type?: string;
    targetSpecies?: string;
    isActive?: boolean;
}
export declare class QueryMedicalProductDto {
    search?: string;
    category?: string;
    type?: string;
    isActive?: boolean;
}
