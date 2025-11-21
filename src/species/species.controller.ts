import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto, UpdateSpeciesDto } from './dto';
import { Lang } from '../common/decorators';
import { getLocalizedName } from '../common/utils/i18n.helper';

/**
 * Controller for species reference data
 * Based on BACKEND_DELTA.md section 5.1
 */
@ApiTags('species')
@Controller('api/v1/species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new species (Admin only)',
    description: 'Creates a species with name in one language. Use lang field to specify which language.'
  })
  @ApiResponse({ status: 201, description: 'Species created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  async create(@Body() createSpeciesDto: CreateSpeciesDto, @Lang() lang: string) {
    const species = await this.speciesService.create(createSpeciesDto);

    return {
      success: true,
      data: {
        id: species.id,
        name: getLocalizedName(species, lang),
        icon: species.icon,
        display_order: species.displayOrder,
      },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all species',
    description: 'Returns species names in the requested language only'
  })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
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
              name: { type: 'string' },
              icon: { type: 'string' },
              display_order: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async findAll(@Lang() lang: string) {
    const species = await this.speciesService.findAll();

    return {
      success: true,
      data: species.map(s => ({
        id: s.id,
        name: getLocalizedName(s, lang),
        icon: s.icon,
        display_order: s.displayOrder,
      })),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a species by ID',
    description: 'Returns species name in the requested language only'
  })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  @ApiResponse({ status: 200, description: 'Species found' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  async findOne(@Param('id') id: string, @Lang() lang: string) {
    const species = await this.speciesService.findOne(id);

    return {
      success: true,
      data: {
        id: species.id,
        name: getLocalizedName(species, lang),
        icon: species.icon,
        display_order: species.displayOrder,
      },
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a species (Admin only)',
    description: 'Update species name in one language. Provide name and lang fields to update a specific language.'
  })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  @ApiResponse({ status: 200, description: 'Species updated successfully' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  async update(@Param('id') id: string, @Body() updateSpeciesDto: UpdateSpeciesDto, @Lang() lang: string) {
    const species = await this.speciesService.update(id, updateSpeciesDto);

    return {
      success: true,
      data: {
        id: species.id,
        name: getLocalizedName(species, lang),
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
