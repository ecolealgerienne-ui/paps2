import { VaccinationType } from '../../common/enums';
export declare class CreateVaccinationDto {
    id?: string;
    animalId: string;
    vaccineId: string;
    veterinarianId?: string;
    routeId?: string;
    campaignId?: string;
    vaccinationType: VaccinationType;
    vaccinationDate: string;
    nextDueDate?: string;
    batchNumber?: string;
    dosage?: number;
    dosageUnit?: string;
    cost?: number;
    notes?: string;
}
export declare class UpdateVaccinationDto {
    vaccineId?: string;
    veterinarianId?: string;
    routeId?: string;
    vaccinationType?: VaccinationType;
    vaccinationDate?: string;
    nextDueDate?: string;
    batchNumber?: string;
    dosage?: number;
    dosageUnit?: string;
    cost?: number;
    notes?: string;
    version?: number;
}
export declare class QueryVaccinationDto {
    animalId?: string;
    vaccineId?: string;
    vaccinationType?: VaccinationType;
    fromDate?: string;
    toDate?: string;
}
