import { IsString, IsOptional, IsBoolean, IsEmail, IsNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVeterinarianDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Title (Dr., Prof., etc.)', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'License number' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ description: 'Specialties (comma-separated or JSON string)' })
  @IsString()
  specialties: string;

  @ApiProperty({ description: 'Clinic name', required: false })
  @IsOptional()
  @IsString()
  clinic?: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Mobile number', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  // 🆕 PHASE_13: Champs géographiques
  @ApiProperty({ description: 'Department code (2-3 chars, e.g., "81", "2A")', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Department must be 2-3 alphanumeric characters' })
  department?: string;

  @ApiProperty({ description: 'Commune code (5 digits, e.g., "81004")', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Commune must be exactly 5 digits' })
  commune?: string;

  @ApiProperty({ description: 'Is available', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Emergency service available', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  emergencyService?: boolean;

  @ApiProperty({ description: 'Working hours', required: false })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiProperty({ description: 'Consultation fee', required: false })
  @IsOptional()
  @IsNumber()
  consultationFee?: number;

  @ApiProperty({ description: 'Emergency fee', required: false })
  @IsOptional()
  @IsNumber()
  emergencyFee?: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Is preferred veterinarian', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @ApiProperty({ description: 'Is default veterinarian', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVeterinarianDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Title (Dr., Prof., etc.)', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'License number', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ description: 'Specialties (comma-separated or JSON string)', required: false })
  @IsOptional()
  @IsString()
  specialties?: string;

  @ApiProperty({ description: 'Clinic name', required: false })
  @IsOptional()
  @IsString()
  clinic?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Mobile number', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Postal code', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  // 🆕 PHASE_13: Champs géographiques
  @ApiProperty({ description: 'Department code (2-3 chars, e.g., "81", "2A")', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Z]{2,3}$/, { message: 'Department must be 2-3 alphanumeric characters' })
  department?: string;

  @ApiProperty({ description: 'Commune code (5 digits, e.g., "81004")', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Commune must be exactly 5 digits' })
  commune?: string;

  @ApiProperty({ description: 'Is available', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Emergency service available', required: false })
  @IsOptional()
  @IsBoolean()
  emergencyService?: boolean;

  @ApiProperty({ description: 'Working hours', required: false })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiProperty({ description: 'Consultation fee', required: false })
  @IsOptional()
  @IsNumber()
  consultationFee?: number;

  @ApiProperty({ description: 'Emergency fee', required: false })
  @IsOptional()
  @IsNumber()
  emergencyFee?: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Is preferred veterinarian', required: false })
  @IsOptional()
  @IsBoolean()
  isPreferred?: boolean;

  @ApiProperty({ description: 'Is default veterinarian', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Rating', required: false })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Version for conflict detection', required: false })
  @IsOptional()
  version?: number;
}

export class QueryVeterinarianDto {
  @ApiProperty({ description: 'Search by name', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Filter by availability', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Filter by emergency service', required: false })
  @IsOptional()
  @IsBoolean()
  emergencyService?: boolean;
}
