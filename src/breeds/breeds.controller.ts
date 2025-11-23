import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BreedsService } from './breeds.service';
import { CreateBreedDto, UpdateBreedDto } from './dto';

/**
 * Controller for breeds reference data
 * Based on BACKEND_DELTA.md section 5.2
 * PHASE_12: Enhanced with soft delete, versioning, code field, and findBySpecies endpoint
 */
@ApiTags('breeds')
@Controller('api/v1/breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new breed (Admin only)' })
  @ApiResponse({ status: 201, description: 'Breed created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createBreedDto: CreateBreedDto) {
    const breed = await this.breedsService.create(createBreedDto);

    return {
      success: true,
      data: {
        id: breed.id,
        code: breed.code,
        species_id: breed.speciesId,
        name_fr: breed.nameFr,
        name_en: breed.nameEn,
        name_ar: breed.nameAr,
        description: breed.description,
        display_order: breed.displayOrder,
        is_active: breed.isActive,
        version: breed.version,
        created_at: breed.createdAt,
        updated_at: breed.updatedAt,
      },
    };
  }

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
        code: b.code,
        species_id: b.speciesId,
        name_fr: b.nameFr,
        name_en: b.nameEn,
        name_ar: b.nameAr,
        description: b.description,
        display_order: b.displayOrder,
        is_active: b.isActive,
        version: b.version,
        created_at: b.createdAt,
        updated_at: b.updatedAt,
      })),
    };
  }

  @Get('species/:speciesId')
  @ApiOperation({ summary: 'Get breeds by species (uses composite index)' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter only active breeds (default: true)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of breeds for the specified species',
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
              code: { type: 'string' },
              species_id: { type: 'string' },
              name_fr: { type: 'string' },
              name_en: { type: 'string' },
              name_ar: { type: 'string' },
              description: { type: 'string' },
              display_order: { type: 'number' },
              is_active: { type: 'boolean' },
              version: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async findBySpecies(
    @Param('speciesId') speciesId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    // Uses composite index: idx_breeds_species_active (speciesId, isActive, deletedAt)
    const active = activeOnly === undefined ? true : activeOnly === 'true';
    const breeds = await this.breedsService.findBySpecies(speciesId, active);

    return {
      success: true,
      data: breeds.map(b => ({
        id: b.id,
        code: b.code,
        species_id: b.speciesId,
        name_fr: b.nameFr,
        name_en: b.nameEn,
        name_ar: b.nameAr,
        description: b.description,
        display_order: b.displayOrder,
        is_active: b.isActive,
        version: b.version,
        created_at: b.createdAt,
        updated_at: b.updatedAt,
      })),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a breed by ID' })
  @ApiResponse({ status: 200, description: 'Breed found' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async findOne(@Param('id') id: string) {
    const breed = await this.breedsService.findOne(id);

    return {
      success: true,
      data: {
        id: breed.id,
        code: breed.code,
        species_id: breed.speciesId,
        name_fr: breed.nameFr,
        name_en: breed.nameEn,
        name_ar: breed.nameAr,
        description: breed.description,
        display_order: breed.displayOrder,
        is_active: breed.isActive,
        version: breed.version,
        created_at: breed.createdAt,
        updated_at: breed.updatedAt,
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a breed (Admin only) - PHASE_12: with optimistic locking' })
  @ApiResponse({ status: 200, description: 'Breed updated successfully' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  @ApiResponse({ status: 409, description: 'Version conflict (optimistic locking)' })
  async update(@Param('id') id: string, @Body() updateBreedDto: UpdateBreedDto) {
    // Extract version for optimistic locking
    const { version, ...dto } = updateBreedDto;
    const breed = await this.breedsService.update(id, dto, version);

    return {
      success: true,
      data: {
        id: breed.id,
        code: breed.code,
        species_id: breed.speciesId,
        name_fr: breed.nameFr,
        name_en: breed.nameEn,
        name_ar: breed.nameAr,
        description: breed.description,
        display_order: breed.displayOrder,
        is_active: breed.isActive,
        version: breed.version,
        created_at: breed.createdAt,
        updated_at: breed.updatedAt,
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
