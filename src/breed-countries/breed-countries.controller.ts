import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BreedCountriesService } from './breed-countries.service';
import { LinkBreedCountryDto } from './dto';

/**
 * Controller for managing Breed-Country associations
 * PHASE_16: BreedCountries
 */
@ApiTags('breed-countries')
@Controller('api/v1/breed-countries')
export class BreedCountriesController {
  constructor(private readonly breedCountriesService: BreedCountriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all breed-country associations (Admin)' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive associations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all breed-country associations',
  })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    const associations = await this.breedCountriesService.findAll(include);

    return {
      success: true,
      data: associations.map((a) => ({
        id: a.id,
        breed_id: a.breedId,
        country_code: a.countryCode,
        is_active: a.isActive,
        created_at: a.createdAt,
        updated_at: a.updatedAt,
        breed: a.breed
          ? {
              id: a.breed.id,
              code: a.breed.code,
              name_fr: a.breed.nameFr,
              name_en: a.breed.nameEn,
              name_ar: a.breed.nameAr,
            }
          : null,
        country: a.country
          ? {
              code: a.country.code,
              name_fr: a.country.nameFr,
              name_en: a.country.nameEn,
              name_ar: a.country.nameAr,
              region: a.country.region,
            }
          : null,
      })),
    };
  }

  @Get('breed/:breedId')
  @ApiOperation({ summary: 'Get all countries for a specific breed' })
  @ApiParam({
    name: 'breedId',
    description: 'Breed UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of countries associated with the breed',
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
              breed_id: { type: 'string' },
              country_code: { type: 'string' },
              is_active: { type: 'boolean' },
              breed: { type: 'object' },
              country: { type: 'object' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async findCountriesByBreed(@Param('breedId') breedId: string) {
    const associations = await this.breedCountriesService.findCountriesByBreed(
      breedId,
    );

    return {
      success: true,
      data: associations.map((a) => ({
        id: a.id,
        breed_id: a.breedId,
        country_code: a.countryCode,
        is_active: a.isActive,
        created_at: a.createdAt,
        updated_at: a.updatedAt,
        breed: {
          id: a.breed.id,
          code: a.breed.code,
          name_fr: a.breed.nameFr,
          name_en: a.breed.nameEn,
          name_ar: a.breed.nameAr,
        },
        country: {
          code: a.country.code,
          name_fr: a.country.nameFr,
          name_en: a.country.nameEn,
          name_ar: a.country.nameAr,
          region: a.country.region,
        },
      })),
    };
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get all breeds for a specific country' })
  @ApiParam({
    name: 'countryCode',
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'DZ',
  })
  @ApiResponse({
    status: 200,
    description: 'List of breeds associated with the country',
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
              breed_id: { type: 'string' },
              country_code: { type: 'string' },
              is_active: { type: 'boolean' },
              breed: { type: 'object' },
              country: { type: 'object' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Country not found' })
  async findBreedsByCountry(@Param('countryCode') countryCode: string) {
    const associations = await this.breedCountriesService.findBreedsByCountry(
      countryCode,
    );

    return {
      success: true,
      data: associations.map((a) => ({
        id: a.id,
        breed_id: a.breedId,
        country_code: a.countryCode,
        is_active: a.isActive,
        created_at: a.createdAt,
        updated_at: a.updatedAt,
        breed: {
          id: a.breed.id,
          code: a.breed.code,
          name_fr: a.breed.nameFr,
          name_en: a.breed.nameEn,
          name_ar: a.breed.nameAr,
        },
        country: {
          code: a.country.code,
          name_fr: a.country.nameFr,
          name_en: a.country.nameEn,
          name_ar: a.country.nameAr,
          region: a.country.region,
        },
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Link a breed to a country' })
  @ApiResponse({
    status: 201,
    description: 'Breed successfully linked to country',
  })
  @ApiResponse({ status: 404, description: 'Breed or Country not found' })
  @ApiResponse({ status: 409, description: 'Association already exists' })
  async link(@Body() dto: LinkBreedCountryDto) {
    const association = await this.breedCountriesService.link(
      dto.breedId,
      dto.countryCode,
    );

    return {
      success: true,
      message: 'Breed successfully linked to country',
      data: {
        id: association.id,
        breed_id: association.breedId,
        country_code: association.countryCode,
        is_active: association.isActive,
        created_at: association.createdAt,
        updated_at: association.updatedAt,
        breed: {
          id: association.breed.id,
          code: association.breed.code,
          name_fr: association.breed.nameFr,
          name_en: association.breed.nameEn,
          name_ar: association.breed.nameAr,
        },
        country: {
          code: association.country.code,
          name_fr: association.country.nameFr,
          name_en: association.country.nameEn,
          name_ar: association.country.nameAr,
          region: association.country.region,
        },
      },
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink a breed from a country' })
  @ApiResponse({
    status: 200,
    description: 'Breed successfully unlinked from country',
  })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async unlink(@Body() dto: LinkBreedCountryDto) {
    const association = await this.breedCountriesService.unlink(
      dto.breedId,
      dto.countryCode,
    );

    return {
      success: true,
      message: 'Breed successfully unlinked from country',
      data: {
        id: association.id,
        breed_id: association.breedId,
        country_code: association.countryCode,
        is_active: association.isActive,
      },
    };
  }
}
