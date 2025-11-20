import { TreatmentStatus } from '../../common/enums';
export declare class CreateTreatmentDto {
    id?: string;
    animalId: string;
    productId: string;
    productName: string;
    veterinarianId?: string;
    veterinarianName?: string;
    campaignId?: string;
    routeId?: string;
    diagnosis?: string;
    treatmentDate: string;
    dose: number;
    dosage?: number;
    dosageUnit?: string;
    duration?: number;
    status?: TreatmentStatus;
    withdrawalEndDate: string;
    cost?: number;
    notes?: string;
}
export declare class UpdateTreatmentDto {
    productId?: string;
    productName?: string;
    veterinarianId?: string;
    veterinarianName?: string;
    campaignId?: string;
    routeId?: string;
    diagnosis?: string;
    treatmentDate?: string;
    dose?: number;
    dosage?: number;
    dosageUnit?: string;
    duration?: number;
    status?: TreatmentStatus;
    withdrawalEndDate?: string;
    cost?: number;
    notes?: string;
    version?: number;
}
export declare class QueryTreatmentDto {
    animalId?: string;
    status?: TreatmentStatus;
    fromDate?: string;
    toDate?: string;
}
