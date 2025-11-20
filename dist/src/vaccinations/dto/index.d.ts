export declare class CreateVaccinationDto {
    id?: string;
    animalId?: string;
    animalIds: string;
    vaccineName: string;
    type: string;
    disease: string;
    veterinarianId?: string;
    veterinarianName?: string;
    vaccinationDate: string;
    nextDueDate?: string;
    batchNumber?: string;
    expiryDate?: string;
    dose: string;
    administrationRoute: string;
    withdrawalPeriodDays: number;
    dosage?: number;
    cost?: number;
    notes?: string;
}
export declare class UpdateVaccinationDto {
    vaccineName?: string;
    type?: string;
    disease?: string;
    veterinarianId?: string;
    veterinarianName?: string;
    vaccinationDate?: string;
    nextDueDate?: string;
    batchNumber?: string;
    expiryDate?: string;
    dose?: string;
    administrationRoute?: string;
    withdrawalPeriodDays?: number;
    dosage?: number;
    cost?: number;
    notes?: string;
    version?: number;
}
export declare class QueryVaccinationDto {
    animalId?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
}
