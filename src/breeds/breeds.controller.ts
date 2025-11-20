import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BreedsService } from './breeds.service';

/**
 * Controller for breeds reference data
 * Based on BACKEND_DELTA.md section 5.2
 */
@ApiTags('breeds')
@Controller('api/v1/breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all breeds, optionally filtered by species' })
  @ApiQuery({
    name: 'speciesId',
    required: false,
    type: String,
    description: 'Filter breeds by species ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all active breeds',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              species_id: { type: 'string' },
              name_fr: { type: 'string' },
              name_en: { type: 'string' },
              name_ar: { type: 'string' },
              description: { type: 'string' },
              display_order: { type: 'number' },
              is_active: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  async findAll(@Query('speciesId') speciesId?: string) {
    const breeds = await this.breedsService.findAll(speciesId);

    return {
      success: true,
      data: breeds.map(b => ({
        id: b.id,
        species_id: b.speciesId,
        name_fr: b.nameFr,
        name_en: b.nameEn,
        name_ar: b.nameAr,
        description: b.description,
        display_order: b.displayOrder,
        is_active: b.isActive,
      })),
    };
  }
}
