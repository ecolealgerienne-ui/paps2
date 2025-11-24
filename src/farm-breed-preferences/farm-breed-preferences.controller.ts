import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FarmBreedPreferencesService } from './farm-breed-preferences.service';
import {
  AddFarmBreedPreferenceDto,
  ReorderFarmBreedPreferenceDto,
  ToggleActiveFarmBreedPreferenceDto,
} from './dto';

/**
 * Controller for managing Farm-Breed preferences
 * PHASE_20: FarmBreedPreferences
 */
@ApiTags('farm-breed-preferences')
@Controller('api/v1/farm-breed-preferences')
export class FarmBreedPreferencesController {
  constructor(
    private readonly farmBreedPreferencesService: FarmBreedPreferencesService,
  ) {}

  @Get('farm/:farmId')
  @ApiOperation({ summary: 'Get all breed preferences for a farm' })
  @ApiParam({
    name: 'farmId',
    description: 'Farm UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'List of breed preferences for the farm',
  })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  async findByFarm(
    @Param('farmId') farmId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const include = includeInactive === 'true';
    const preferences = await this.farmBreedPreferencesService.findByFarm(
      farmId,
      include,
    );

    return {
      success: true,
      data: preferences.map((p) => ({
        id: p.id,
        farm_id: p.farmId,
        breed_id: p.breedId,
        display_order: p.displayOrder,
        is_active: p.isActive,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
        breed: p.breed
          ? {
              id: p.breed.id,
              code: p.breed.code,
              name_fr: p.breed.nameFr,
              name_en: p.breed.nameEn,
              name_ar: p.breed.nameAr,
              species_id: p.breed.speciesId,
            }
          : null,
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Add a breed preference to a farm' })
  @ApiResponse({
    status: 201,
    description: 'Breed preference successfully added',
  })
  @ApiResponse({ status: 404, description: 'Farm or Breed not found' })
  @ApiResponse({ status: 409, description: 'Preference already exists' })
  async add(@Body() dto: AddFarmBreedPreferenceDto) {
    const preference = await this.farmBreedPreferencesService.add(
      dto.farmId,
      dto.breedId,
    );

    return {
      success: true,
      message: 'Breed preference successfully added to farm',
      data: {
        id: preference.id,
        farm_id: preference.farmId,
        breed_id: preference.breedId,
        display_order: preference.displayOrder,
        is_active: preference.isActive,
        created_at: preference.createdAt,
        updated_at: preference.updatedAt,
        breed: preference.breed
          ? {
              id: preference.breed.id,
              code: preference.breed.code,
              name_fr: preference.breed.nameFr,
              name_en: preference.breed.nameEn,
              name_ar: preference.breed.nameAr,
              species_id: preference.breed.speciesId,
            }
          : null,
      },
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a breed preference from a farm' })
  @ApiResponse({
    status: 200,
    description: 'Breed preference successfully removed',
  })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  async remove(@Body() dto: AddFarmBreedPreferenceDto) {
    await this.farmBreedPreferencesService.remove(dto.farmId, dto.breedId);

    return {
      success: true,
      message: 'Breed preference successfully removed from farm',
    };
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder a breed preference for a farm' })
  @ApiResponse({
    status: 200,
    description: 'Breed preference successfully reordered',
  })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  async reorder(@Body() dto: ReorderFarmBreedPreferenceDto) {
    const preference = await this.farmBreedPreferencesService.reorder(
      dto.farmId,
      dto.breedId,
      dto.displayOrder,
    );

    return {
      success: true,
      message: 'Breed preference successfully reordered',
      data: {
        id: preference.id,
        farm_id: preference.farmId,
        breed_id: preference.breedId,
        display_order: preference.displayOrder,
        is_active: preference.isActive,
        breed: preference.breed
          ? {
              id: preference.breed.id,
              code: preference.breed.code,
              name_fr: preference.breed.nameFr,
              name_en: preference.breed.nameEn,
              name_ar: preference.breed.nameAr,
              species_id: preference.breed.speciesId,
            }
          : null,
      },
    };
  }

  @Patch('toggle-active')
  @ApiOperation({ summary: 'Toggle active status of a breed preference' })
  @ApiResponse({
    status: 200,
    description: 'Breed preference active status successfully toggled',
  })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  async toggleActive(@Body() dto: ToggleActiveFarmBreedPreferenceDto) {
    const preference = await this.farmBreedPreferencesService.toggleActive(
      dto.farmId,
      dto.breedId,
      dto.isActive,
    );

    return {
      success: true,
      message: 'Breed preference active status successfully toggled',
      data: {
        id: preference.id,
        farm_id: preference.farmId,
        breed_id: preference.breedId,
        display_order: preference.displayOrder,
        is_active: preference.isActive,
        breed: preference.breed
          ? {
              id: preference.breed.id,
              code: preference.breed.code,
              name_fr: preference.breed.nameFr,
              name_en: preference.breed.nameEn,
              name_ar: preference.breed.nameAr,
              species_id: preference.breed.speciesId,
            }
          : null,
      },
    };
  }
}
