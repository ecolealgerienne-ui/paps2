export declare class CreateVeterinarianDto {
    firstName: string;
    lastName: string;
    licenseNumber?: string;
    specialties?: string[];
    clinic?: string;
    phone?: string;
    email?: string;
    address?: string;
    isAvailable?: boolean;
    emergencyService?: boolean;
    consultationFee?: number;
    isActive?: boolean;
}
export declare class UpdateVeterinarianDto {
    firstName?: string;
    lastName?: string;
    licenseNumber?: string;
    specialties?: string[];
    clinic?: string;
    phone?: string;
    email?: string;
    address?: string;
    isAvailable?: boolean;
    emergencyService?: boolean;
    consultationFee?: number;
    rating?: number;
    isActive?: boolean;
}
export declare class QueryVeterinarianDto {
    search?: string;
    isActive?: boolean;
    isAvailable?: boolean;
    emergencyService?: boolean;
}
