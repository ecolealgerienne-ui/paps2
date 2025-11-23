import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiProperty({ example: 'DZ' })
  code: string;

  @ApiProperty({ example: 'Algérie' })
  nameFr: string;

  @ApiProperty({ example: 'Algeria' })
  nameEn: string;

  @ApiProperty({ example: 'الجزائر' })
  nameAr: string;

  @ApiPropertyOptional({ example: 'Africa' })
  region?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
