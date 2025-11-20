import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';

/**
 * Base DTO for all SYNC entities (8 transactional entities)
 *
 * Provides common fields required by offline-first architecture:
 * - farmId: Multi-tenancy support
 * - created_at: Preserves client creation timestamp (offline scenario)
 * - updated_at: Preserves client modification timestamp (offline scenario)
 *
 * According to API_SIGNATURES.md, the backend MUST preserve these timestamps
 * to maintain accurate audit trails for records created/modified offline.
 *
 * @see API_SIGNATURES.md Section 2 - Generic Field Handling Rules
 */
export abstract class BaseSyncEntityDto {
  @ApiProperty({
    description: 'Farm ID for multi-tenancy (can be provided by client or from route param)',
    required: false
  })
  @IsOptional()
  @IsString()
  farmId?: string;

  @ApiProperty({
    description: 'Client creation timestamp - preserves offline creation time (CRITICAL: backend must use this if provided)',
    required: false,
    example: '2024-01-15T08:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  created_at?: string;

  @ApiProperty({
    description: 'Client update timestamp - preserves offline modification time (CRITICAL: backend must use this if provided)',
    required: false,
    example: '2024-01-16T10:30:00Z'
  })
  @IsOptional()
  @IsDateString()
  updated_at?: string;
}
