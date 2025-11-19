import { TreatmentStatus } from '../../common/enums';
export declare class CreateTreatmentDto {
    id?: string;
    animalId: string;
    productId?: string;
    veterinarianId?: string;
    routeId?: string;
    diagnosis?: string;
    treatmentDate: string;
    dosage?: number;
    dosageUnit?: string;
    duration?: number;
    status?: TreatmentStatus;
    withdrawalEndDate?: string;
    cost?: number;
    notes?: string;
}
export declare class UpdateTreatmentDto {
    productId?: string;
    veterinarianId?: string;
    routeId?: string;
    diagnosis?: string;
    treatmentDate?: string;
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
