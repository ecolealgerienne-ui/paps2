export declare class CreateVeterinarianDto {
    firstName: string;
    lastName: string;
    title?: string;
    licenseNumber: string;
    specialties: string;
    clinic?: string;
    phone: string;
    mobile?: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    isAvailable?: boolean;
    emergencyService?: boolean;
    workingHours?: string;
    consultationFee?: number;
    emergencyFee?: number;
    currency?: string;
    notes?: string;
    isPreferred?: boolean;
    isDefault?: boolean;
    isActive?: boolean;
}
export declare class UpdateVeterinarianDto {
    firstName?: string;
    lastName?: string;
    title?: string;
    licenseNumber?: string;
    specialties?: string;
    clinic?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    isAvailable?: boolean;
    emergencyService?: boolean;
    workingHours?: string;
    consultationFee?: number;
    emergencyFee?: number;
    currency?: string;
    notes?: string;
    isPreferred?: boolean;
    isDefault?: boolean;
    rating?: number;
    isActive?: boolean;
    version?: number;
}
export declare class QueryVeterinarianDto {
    search?: string;
    isActive?: boolean;
    isAvailable?: boolean;
    emergencyService?: boolean;
}
