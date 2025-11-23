import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto, UpdateSpeciesDto } from './dto';
import { SpeciesResponseDto } from './dto/species-response.dto';

/**
 * Controller for species reference data
 * PHASE_01: Added soft delete, versioning, restore endpoint
 */
@ApiTags('species')
@Controller('api/v1/species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new species (Admin only)' })
  @ApiResponse({ status: 201, description: 'Species created successfully', type: SpeciesResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Species already exists' })
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
        description: species.description,
        version: species.version,
        created_at: species.createdAt,
        updated_at: species.updatedAt,
        deleted_at: species.deletedAt,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all species' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Include soft-deleted species' })
  @ApiResponse({ status: 200, description: 'List of species', type: [SpeciesResponseDto] })
  async findAll(@Query('includeDeleted') includeDeleted?: string) {
    const species = await this.speciesService.findAll(includeDeleted === 'true');

    return {
      success: true,
      data: species.map(s => ({
        id: s.id,
        name_fr: s.nameFr,
        name_en: s.nameEn,
        name_ar: s.nameAr,
        icon: s.icon,
        display_order: s.displayOrder,
        description: s.description,
        version: s.version,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
        deleted_at: s.deletedAt,
      })),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a species by ID' })
  @ApiResponse({ status: 200, description: 'Species found', type: SpeciesResponseDto })
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
        description: species.description,
        version: species.version,
        created_at: species.createdAt,
        updated_at: species.updatedAt,
        deleted_at: species.deletedAt,
      },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a species (Admin only)' })
  @ApiResponse({ status: 200, description: 'Species updated successfully', type: SpeciesResponseDto })
  @ApiResponse({ status: 404, description: 'Species not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
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
        description: species.description,
        version: species.version,
        created_at: species.createdAt,
        updated_at: species.updatedAt,
        deleted_at: species.deletedAt,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a species (Admin only)' })
  @ApiResponse({ status: 204, description: 'Species soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  @ApiResponse({ status: 409, description: 'Species is used by active breeds' })
  async remove(@Param('id') id: string) {
    await this.speciesService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted species (Admin only)' })
  @ApiResponse({ status: 200, description: 'Species restored successfully', type: SpeciesResponseDto })
  @ApiResponse({ status: 404, description: 'Species not found' })
  @ApiResponse({ status: 409, description: 'Species is not deleted' })
  async restore(@Param('id') id: string) {
    const species = await this.speciesService.restore(id);

    return {
      success: true,
      data: {
        id: species.id,
        name_fr: species.nameFr,
        name_en: species.nameEn,
        name_ar: species.nameAr,
        icon: species.icon,
        display_order: species.displayOrder,
        description: species.description,
        version: species.version,
        created_at: species.createdAt,
        updated_at: species.updatedAt,
        deleted_at: species.deletedAt,
      },
    };
  }
}
