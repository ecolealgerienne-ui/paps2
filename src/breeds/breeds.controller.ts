import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BreedsService } from './breeds.service';
import { CreateBreedDto, UpdateBreedDto } from './dto';
import { Lang } from '../common/decorators';
import { getLocalizedName } from '../common/utils/i18n.helper';

/**
 * Controller for breeds reference data
 * Based on BACKEND_DELTA.md section 5.2
 */
@ApiTags('breeds')
@Controller('api/v1/breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new breed (Admin only)',
    description: 'Creates a breed with name in one language. Use lang field to specify which language.'
  })
  @ApiResponse({ status: 201, description: 'Breed created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  async create(@Body() createBreedDto: CreateBreedDto, @Lang() lang: string) {
    const breed = await this.breedsService.create(createBreedDto);

    return {
      success: true,
      data: {
        id: breed.id,
        species_id: breed.speciesId,
        name: getLocalizedName(breed, lang),
        description: breed.description,
        display_order: breed.displayOrder,
        is_active: breed.isActive,
      },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all breeds, optionally filtered by species',
    description: 'Returns breed names in the requested language only'
  })
  @ApiQuery({
    name: 'speciesId',
    required: false,
    type: String,
    description: 'Filter breeds by species ID',
  })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
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
              name: { type: 'string' },
              description: { type: 'string' },
              display_order: { type: 'number' },
              is_active: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  async findAll(@Query('speciesId') speciesId?: string, @Lang() lang?: string) {
    const breeds = await this.breedsService.findAll(speciesId);

    return {
      success: true,
      data: breeds.map(b => ({
        id: b.id,
        species_id: b.speciesId,
        name: getLocalizedName(b, lang),
        description: b.description,
        display_order: b.displayOrder,
        is_active: b.isActive,
      })),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a breed by ID',
    description: 'Returns breed name in the requested language only'
  })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  @ApiResponse({ status: 200, description: 'Breed found' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async findOne(@Param('id') id: string, @Lang() lang: string) {
    const breed = await this.breedsService.findOne(id);

    return {
      success: true,
      data: {
        id: breed.id,
        species_id: breed.speciesId,
        name: getLocalizedName(breed, lang),
        description: breed.description,
        display_order: breed.displayOrder,
        is_active: breed.isActive,
      },
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a breed (Admin only)',
    description: 'Update breed name in one language. Provide name and lang fields to update a specific language.'
  })
  @ApiQuery({ name: 'lang', required: false, enum: ['fr', 'en', 'ar'], description: 'Language for response (default: fr)' })
  @ApiResponse({ status: 200, description: 'Breed updated successfully' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async update(@Param('id') id: string, @Body() updateBreedDto: UpdateBreedDto, @Lang() lang: string) {
    const breed = await this.breedsService.update(id, updateBreedDto);

    return {
      success: true,
      data: {
        id: breed.id,
        species_id: breed.speciesId,
        name: getLocalizedName(breed, lang),
        description: breed.description,
        display_order: breed.displayOrder,
        is_active: breed.isActive,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a breed (Admin only)' })
  @ApiResponse({ status: 204, description: 'Breed deleted successfully' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async remove(@Param('id') id: string) {
    await this.breedsService.remove(id);
  }
}
