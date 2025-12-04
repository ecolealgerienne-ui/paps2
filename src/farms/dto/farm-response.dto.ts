import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FarmCountsDto {
  @ApiPropertyOptional({ description: 'Number of animals' })
  animals?: number;

  @ApiPropertyOptional({ description: 'Number of lots' })
  lots?: number;

  @ApiPropertyOptional({ description: 'Number of veterinarians' })
  veterinarians?: number;

  @ApiPropertyOptional({ description: 'Number of movements' })
  movements?: number;

  @ApiPropertyOptional({ description: 'Number of personal campaigns' })
  personalCampaigns?: number;

  @ApiPropertyOptional({ description: 'Number of treatments' })
  treatments?: number;

  @ApiPropertyOptional({ description: 'Number of breedings' })
  breedings?: number;

  @ApiPropertyOptional({ description: 'Number of weights' })
  weights?: number;

  @ApiPropertyOptional({ description: 'Number of documents' })
  documents?: number;

  @ApiPropertyOptional({ description: 'Number of alert configurations' })
  alertConfigurations?: number;
}

export class FarmResponseDto {
  @ApiProperty({ description: 'Farm ID (UUID)', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ description: 'Owner ID', example: 'user-123' })
  ownerId: string;

  @ApiPropertyOptional({ description: 'Group ID', nullable: true })
  groupId: string | null;

  @ApiProperty({ description: 'Farm name', example: 'Ma Ferme' })
  name: string;

  @ApiPropertyOptional({ description: 'Farm address', nullable: true })
  address: string | null;

  @ApiPropertyOptional({ description: 'Postal code', nullable: true })
  postalCode: string | null;

  @ApiPropertyOptional({ description: 'City', nullable: true })
  city: string | null;

  @ApiPropertyOptional({ description: 'Country code (ISO 3166-1 alpha-2)', example: 'FR', nullable: true })
  country: string | null;

  @ApiPropertyOptional({ description: 'Department code', example: '81', nullable: true })
  department: string | null;

  @ApiPropertyOptional({ description: 'Commune code (INSEE)', example: '81004', nullable: true })
  commune: string | null;

  @ApiPropertyOptional({ description: 'Latitude', nullable: true })
  latitude: number | null;

  @ApiPropertyOptional({ description: 'Longitude', nullable: true })
  longitude: number | null;

  @ApiProperty({ description: 'Farm location (legacy field)', example: 'Albi, France' })
  location: string;

  @ApiPropertyOptional({ description: 'Cheptel number', nullable: true })
  cheptelNumber: string | null;

  @ApiPropertyOptional({ description: 'Group name', nullable: true })
  groupName: string | null;

  @ApiProperty({ description: 'Is default farm', example: false })
  isDefault: boolean;

  @ApiProperty({ description: 'Is farm active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Version for optimistic locking', example: 1 })
  version: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Deletion timestamp (soft delete)', nullable: true })
  deletedAt: Date | null;

  @ApiPropertyOptional({ description: 'Farm preferences' })
  preferences?: object | null;

  @ApiPropertyOptional({ description: 'Entity counts', type: FarmCountsDto })
  _count?: FarmCountsDto;
}
