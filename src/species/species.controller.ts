import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto, UpdateSpeciesDto } from './dto';

/**
 * Controller for species reference data
 * Based on BACKEND_DELTA.md section 5.1
 */
@ApiTags('species')
@Controller('api/v1/species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new species (Admin only)' })
  @ApiResponse({ status: 201, description: 'Species created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createSpeciesDto: CreateSpeciesDto) {
    const species = await this.speciesService.create(createSpeciesDto);

    return {
      success: true,
      data: {
        id: species.id,
        name_fr: species.nameFr,
        name_en: species.nameEn,
        name_ar: species.nameAr,
        icon: species.icon,
        display_order: species.displayOrder,
      },
    };
  }

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

  @Get(':id')
  @ApiOperation({ summary: 'Get a species by ID' })
  @ApiResponse({ status: 200, description: 'Species found' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  async findOne(@Param('id') id: string) {
    const species = await this.speciesService.findOne(id);

    return {
      success: true,
      data: {
        id: species.id,
        name_fr: species.nameFr,
        name_en: species.nameEn,
        name_ar: species.nameAr,
        icon: species.icon,
        display_order: species.displayOrder,
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a species (Admin only)' })
  @ApiResponse({ status: 200, description: 'Species updated successfully' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  async update(@Param('id') id: string, @Body() updateSpeciesDto: UpdateSpeciesDto) {
    const species = await this.speciesService.update(id, updateSpeciesDto);

    return {
      success: true,
      data: {
        id: species.id,
        name_fr: species.nameFr,
        name_en: species.nameEn,
        name_ar: species.nameAr,
        icon: species.icon,
        display_order: species.displayOrder,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a species (Admin only)' })
  @ApiResponse({ status: 204, description: 'Species deleted successfully' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  async remove(@Param('id') id: string) {
    await this.speciesService.remove(id);
  }
}
