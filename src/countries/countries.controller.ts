import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

/**
 * Controller for managing countries reference data
 * PHASE_04: ISO 3166-1 countries with multi-language support
 */
@ApiTags('countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  /**
   * Create a new country
   */
  @Post()
  @ApiOperation({ summary: 'Create a new country' })
  @ApiResponse({
    status: 201,
    description: 'Country successfully created',
  })
  @ApiResponse({
    status: 409,
    description: 'Country with this code already exists',
  })
  async create(@Body() createCountryDto: CreateCountryDto) {
    const country = await this.countriesService.create(createCountryDto);
    return {
      success: true,
      data: country,
    };
  }

  /**
   * Get list of all regions
   */
  @Get('regions')
  @ApiOperation({ summary: 'Get list of available regions' })
  @ApiResponse({
    status: 200,
    description: 'List of regions returned',
  })
  async getRegions() {
    const regions = await this.countriesService.getRegions();
    return {
      success: true,
      data: regions,
    };
  }

  /**
   * Get countries by region
   */
  @Get('region/:region')
  @ApiOperation({ summary: 'Get countries by region' })
  @ApiParam({
    name: 'region',
    description: 'Region name',
    example: 'Africa',
  })
  @ApiResponse({
    status: 200,
    description: 'Countries in the specified region',
  })
  async findByRegion(@Param('region') region: string) {
    const countries = await this.countriesService.findByRegion(region);
    return {
      success: true,
      data: countries,
    };
  }

  /**
   * Get all countries with optional filters
   */
  @Get()
  @ApiOperation({ summary: 'Get all countries with optional filters' })
  @ApiQuery({
    name: 'region',
    required: false,
    description: 'Filter by region',
    example: 'Europe',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    description: 'Include inactive countries',
    type: Boolean,
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of countries',
  })
  async findAll(
    @Query('region') region?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const includeInactiveBool = includeInactive === 'true';
    const countries = await this.countriesService.findAll(
      region,
      includeInactiveBool,
    );
    return {
      success: true,
      data: countries,
    };
  }

  /**
   * Get a single country by code
   */
  @Get(':code')
  @ApiOperation({ summary: 'Get a country by ISO code' })
  @ApiParam({
    name: 'code',
    description: 'ISO 3166-1 alpha-2 code',
    example: 'DZ',
  })
  @ApiResponse({
    status: 200,
    description: 'Country found',
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
  })
  async findOne(@Param('code') code: string) {
    const country = await this.countriesService.findOne(code);
    return {
      success: true,
      data: country,
    };
  }

  /**
   * Update a country
   */
  @Patch(':code')
  @ApiOperation({ summary: 'Update a country' })
  @ApiParam({
    name: 'code',
    description: 'ISO 3166-1 alpha-2 code',
    example: 'DZ',
  })
  @ApiResponse({
    status: 200,
    description: 'Country successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
  })
  async update(
    @Param('code') code: string,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    const country = await this.countriesService.update(code, updateCountryDto);
    return {
      success: true,
      data: country,
    };
  }

  /**
   * Toggle active status of a country
   */
  @Patch(':code/toggle-active')
  @ApiOperation({ summary: 'Toggle active status of a country' })
  @ApiParam({
    name: 'code',
    description: 'ISO 3166-1 alpha-2 code',
    example: 'DZ',
  })
  @ApiResponse({
    status: 200,
    description: 'Country active status toggled',
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
  })
  async toggleActive(
    @Param('code') code: string,
    @Body('isActive') isActive: boolean,
  ) {
    const country = await this.countriesService.toggleActive(code, isActive);
    return {
      success: true,
      data: country,
    };
  }

  /**
   * Delete a country
   */
  @Delete(':code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a country' })
  @ApiParam({
    name: 'code',
    description: 'ISO 3166-1 alpha-2 code',
    example: 'DZ',
  })
  @ApiResponse({
    status: 200,
    description: 'Country successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Country not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Country is used in liaisons and cannot be deleted',
  })
  async remove(@Param('code') code: string) {
    const country = await this.countriesService.remove(code);
    return {
      success: true,
      data: country,
      message: `Country "${code}" successfully deleted`,
    };
  }
}
