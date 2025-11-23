import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpeciesResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nameFr: string;

  @ApiProperty()
  nameEn: string;

  @ApiProperty()
  nameAr: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  displayOrder: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date;
}
