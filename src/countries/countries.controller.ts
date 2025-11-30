import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { CountriesService, PaginatedResponse } from './countries.service';
import { CreateCountryDto, UpdateCountryDto, CountryResponseDto } from './dto';
import { AuthGuard, AdminGuard } from '../auth/guards';

@ApiTags('Countries')
@Controller('api/v1/countries')
export class CountriesController {
  constructor(private readonly service: CountriesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new country (Admin only)' })
  @ApiResponse({ status: 201, description: 'Country created successfully', type: CountryResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 409, description: 'Country code already exists' })
  create(@Body() dto: CreateCountryDto): Promise<CountryResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all countries with pagination, filtering, and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'region', required: false, type: String, description: 'Filter by region' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in country names (fr, en, ar)' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['nameFr', 'nameEn', 'nameAr', 'region', 'code', 'createdAt'], description: 'Sort field' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({ status: 200, description: 'List of countries with pagination metadata' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('region') region?: string,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy', new DefaultValuePipe('nameFr')) orderBy?: string,
    @Query('order', new DefaultValuePipe('ASC')) order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.service.findAll({
      page,
      limit: Math.min(limit, 100), // Max 100 items per page
      region,
      isActive,
      search,
      orderBy,
      order,
    });
  }

  @Get('regions')
  @ApiOperation({ summary: 'Get list of distinct regions' })
  @ApiResponse({ status: 200, description: 'List of regions', type: [String] })
  getRegions() {
    return this.service.getRegions();
  }

  @Get('region/:region')
  @ApiOperation({ summary: 'Get countries by region' })
  @ApiParam({ name: 'region', description: 'Region name (e.g., Africa, Europe)' })
  @ApiResponse({ status: 200, description: 'Countries in the specified region', type: [CountryResponseDto] })
  findByRegion(@Param('region') region: string) {
    return this.service.findByRegion(region);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get country details by ISO code' })
  @ApiParam({ name: 'code', description: 'ISO 3166-1 alpha-2 code (e.g., DZ, FR)' })
  @ApiResponse({ status: 200, description: 'Country details', type: CountryResponseDto })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findOne(@Param('code') code: string): Promise<CountryResponseDto> {
    return this.service.findOne(code);
  }

  @Patch(':code')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a country (Admin only)' })
  @ApiParam({ name: 'code', description: 'ISO 3166-1 alpha-2 code' })
  @ApiResponse({ status: 200, description: 'Country updated successfully', type: CountryResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  update(
    @Param('code') code: string,
    @Body() dto: UpdateCountryDto
  ): Promise<CountryResponseDto> {
    return this.service.update(code, dto);
  }

  @Patch(':code/toggle-active')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle country active status (Admin only)' })
  @ApiParam({ name: 'code', description: 'ISO 3166-1 alpha-2 code' })
  @ApiResponse({ status: 200, description: 'Country status toggled successfully', type: CountryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  toggleActive(
    @Param('code') code: string,
    @Body('isActive', ParseBoolPipe) isActive: boolean
  ): Promise<CountryResponseDto> {
    return this.service.toggleActive(code, isActive);
  }

  @Delete(':code')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a country (Admin only)' })
  @ApiParam({ name: 'code', description: 'ISO 3166-1 alpha-2 code' })
  @ApiResponse({ status: 200, description: 'Country deleted successfully', type: CountryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  @ApiResponse({ status: 409, description: 'Country is used in other entities (breeds, campaigns, products)' })
  remove(@Param('code') code: string): Promise<CountryResponseDto> {
    return this.service.remove(code);
  }
}
