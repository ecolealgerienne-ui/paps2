import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { CreateCountryDto, UpdateCountryDto } from './dto';

@ApiTags('countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly service: CountriesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un pays' })
  @ApiResponse({ status: 201, description: 'Country created' })
  @ApiResponse({ status: 409, description: 'Country already exists' })
  create(@Body() dto: CreateCountryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des pays' })
  @ApiQuery({ name: 'region', required: false })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of countries' })
  findAll(
    @Query('region') region?: string,
    @Query('includeInactive') includeInactive?: string
  ) {
    return this.service.findAll(region, includeInactive === 'true');
  }

  @Get('regions')
  @ApiOperation({ summary: 'Liste des régions' })
  @ApiResponse({ status: 200, description: 'List of regions' })
  getRegions() {
    return this.service.getRegions();
  }

  @Get('region/:region')
  @ApiOperation({ summary: 'Pays par région' })
  @ApiResponse({ status: 200, description: 'Countries by region' })
  findByRegion(@Param('region') region: string) {
    return this.service.findByRegion(region);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Détails pays par code ISO' })
  @ApiResponse({ status: 200, description: 'Country details' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findOne(@Param('code') code: string) {
    return this.service.findOne(code);
  }

  @Patch(':code')
  @ApiOperation({ summary: 'Mettre à jour un pays' })
  @ApiResponse({ status: 200, description: 'Country updated' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  update(@Param('code') code: string, @Body() dto: UpdateCountryDto) {
    return this.service.update(code, dto);
  }

  @Patch(':code/toggle-active')
  @ApiOperation({ summary: 'Activer/désactiver un pays' })
  @ApiResponse({ status: 200, description: 'Country status toggled' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  toggleActive(@Param('code') code: string, @Body('isActive') isActive: boolean) {
    return this.service.toggleActive(code, isActive);
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Supprimer un pays' })
  @ApiResponse({ status: 200, description: 'Country deleted' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  @ApiResponse({ status: 409, description: 'Country is used in liaisons' })
  remove(@Param('code') code: string) {
    return this.service.remove(code);
  }
}
