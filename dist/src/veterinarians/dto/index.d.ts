export declare class CreateVeterinarianDto {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    licenseNumber?: string;
    specialization?: string;
    isActive?: boolean;
}
export declare class UpdateVeterinarianDto {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    licenseNumber?: string;
    specialization?: string;
    isActive?: boolean;
}
export declare class QueryVeterinarianDto {
    search?: string;
    isActive?: boolean;
}
