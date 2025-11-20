import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SpeciesService } from './species.service';

/**
 * Controller for species reference data
 * Based on BACKEND_DELTA.md section 5.1
 */
@ApiTags('species')
@Controller('api/v1/species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all species' })
  @ApiResponse({
    status: 200,
    description: 'List of all active species',
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
              name_fr: { type: 'string' },
              name_en: { type: 'string' },
              name_ar: { type: 'string' },
              icon: { type: 'string' },
              display_order: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async findAll() {
    const species = await this.speciesService.findAll();

    return {
      success: true,
      data: species.map(s => ({
        id: s.id,
        name_fr: s.nameFr,
        name_en: s.nameEn,
        name_ar: s.nameAr,
        icon: s.icon,
        display_order: s.displayOrder,
      })),
    };
  }
}
