import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BreedCountriesService, FindAllOptions, PaginatedResponse } from './breed-countries.service';
import { LinkBreedCountryDto, BreedCountryResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for managing Breed-Country associations
 * PHASE_16: BreedCountries - Migrated to /api/v1 with pagination, search, and Guards
 */
@ApiTags('Breed-Countries')
@Controller('api/v1/breed-countries')
export class BreedCountriesController {
  constructor(private readonly breedCountriesService: BreedCountriesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a breed to a country (Admin only)' })
  @ApiResponse({ status: 201, description: 'Breed successfully linked to country', type: BreedCountryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Breed or Country not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Association already exists' })
  link(@Body() dto: LinkBreedCountryDto): Promise<BreedCountryResponseDto> {
    return this.breedCountriesService.link(dto.breedId, dto.countryCode);
  }

  @Get()
  @ApiOperation({ summary: 'Get all breed-country associations with pagination, filters, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
  @ApiQuery({ name: 'breedId', required: false, description: 'Filter by breed ID' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'Filter by country code (ISO 3166-1 alpha-2)', example: 'DZ' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'search', required: false, description: 'Search in breed code, names, country code, names', example: 'holstein' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Field to sort by (createdAt, updatedAt, isActive)', example: 'createdAt' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (ASC or DESC)', example: 'ASC' })
  @ApiResponse({ status: 200, description: 'Breed-country associations list with pagination metadata' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('breedId') breedId?: string,
    @Query('countryCode') countryCode?: string,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.breedCountriesService.findAll({ page, limit, breedId, countryCode, isActive, search, orderBy, order });
  }

  @Get('breed/:breedId')
  @ApiOperation({ summary: 'Get all countries for a specific breed' })
  @ApiParam({ name: 'breedId', description: 'Breed UUID' })
  @ApiResponse({ status: 200, description: 'List of countries associated with the breed', type: [BreedCountryResponseDto] })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  findCountriesByBreed(@Param('breedId') breedId: string): Promise<BreedCountryResponseDto[]> {
    return this.breedCountriesService.findCountriesByBreed(breedId);
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get all breeds for a specific country' })
  @ApiParam({ name: 'countryCode', description: 'Country code (ISO 3166-1 alpha-2)', example: 'DZ' })
  @ApiResponse({ status: 200, description: 'List of breeds associated with the country', type: [BreedCountryResponseDto] })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findBreedsByCountry(@Param('countryCode') countryCode: string): Promise<BreedCountryResponseDto[]> {
    return this.breedCountriesService.findBreedsByCountry(countryCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a breed-country association by ID' })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association found', type: BreedCountryResponseDto })
  @ApiResponse({ status: 404, description: 'Association not found' })
  findOne(@Param('id') id: string): Promise<BreedCountryResponseDto> {
    return this.breedCountriesService.findOne(id);
  }

  @Delete()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink a breed from a country (Admin only)' })
  @ApiResponse({ status: 200, description: 'Breed successfully unlinked from country', type: BreedCountryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  unlink(@Body() dto: LinkBreedCountryDto): Promise<BreedCountryResponseDto> {
    return this.breedCountriesService.unlink(dto.breedId, dto.countryCode);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a deactivated breed-country association (Admin only)' })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association restored successfully', type: BreedCountryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Association is not deactivated' })
  restore(@Param('id') id: string): Promise<BreedCountryResponseDto> {
    return this.breedCountriesService.restore(id);
  }
}
