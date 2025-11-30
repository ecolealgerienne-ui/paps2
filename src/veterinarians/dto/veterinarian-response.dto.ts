import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataScope } from '@prisma/client';

/**
 * Response DTO for Veterinarian entity (PHASE_16)
 * Handles both global and local veterinarians (scope pattern)
 */
export class VeterinarianResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Veterinarian scope', enum: DataScope })
  scope: DataScope;

  @ApiPropertyOptional({ description: 'Farm ID (null for global, set for local)' })
  farmId: string | null;

  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;

  @ApiPropertyOptional({ description: 'Title (Dr., Prof., etc.)' })
  title: string | null;

  @ApiPropertyOptional({ description: 'License number' })
  licenseNumber: string | null;

  @ApiPropertyOptional({ description: 'Specialties (comma-separated or JSON)' })
  specialties: string | null;

  @ApiPropertyOptional({ description: 'Clinic name' })
  clinic: string | null;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone: string | null;

  @ApiPropertyOptional({ description: 'Mobile number' })
  mobile: string | null;

  @ApiPropertyOptional({ description: 'Email address' })
  email: string | null;

  @ApiPropertyOptional({ description: 'Address' })
  address: string | null;

  @ApiPropertyOptional({ description: 'City' })
  city: string | null;

  @ApiPropertyOptional({ description: 'Postal code' })
  postalCode: string | null;

  @ApiPropertyOptional({ description: 'Country' })
  country: string | null;

  @ApiPropertyOptional({ description: 'Department code (2-3 chars)' })
  department: string | null;

  @ApiPropertyOptional({ description: 'Commune code (5 digits)' })
  commune: string | null;

  @ApiProperty({ description: 'Is available for consultations' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Provides emergency service' })
  emergencyService: boolean;

  @ApiPropertyOptional({ description: 'Working hours' })
  workingHours: string | null;

  @ApiPropertyOptional({ description: 'Consultation fee' })
  consultationFee: number | null;

  @ApiPropertyOptional({ description: 'Emergency fee' })
  emergencyFee: number | null;

  @ApiPropertyOptional({ description: 'Currency code' })
  currency: string | null;

  @ApiPropertyOptional({ description: 'Notes' })
  notes: string | null;

  @ApiProperty({ description: 'Is preferred veterinarian' })
  isPreferred: boolean;

  @ApiProperty({ description: 'Is default veterinarian for farm' })
  isDefault: boolean;

  @ApiProperty({ description: 'Rating (1-5)' })
  rating: number;

  @ApiProperty({ description: 'Total number of interventions' })
  totalInterventions: number;

  @ApiPropertyOptional({ description: 'Last intervention date' })
  lastInterventionDate: Date | null;

  @ApiProperty({ description: 'Active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Version for optimistic locking' })
  version: number;

  @ApiPropertyOptional({ description: 'Soft delete timestamp' })
  deletedAt: Date | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
