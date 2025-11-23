import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { VaccineCountriesService } from './vaccine-countries.service';
import { CreateVaccineCountryDto, UpdateVaccineCountryDto } from './dto';

@ApiTags('vaccine-countries')
@Controller('vaccine-countries')
export class VaccineCountriesController {
  constructor(private readonly vaccineCountriesService: VaccineCountriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create vaccine-country association' })
  @ApiResponse({ status: 201, description: 'Association created successfully' })
  @ApiResponse({ status: 409, description: 'Association already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() dto: CreateVaccineCountryDto) {
    return this.vaccineCountriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vaccine-country associations' })
  @ApiResponse({ status: 200, description: 'List of all associations' })
  findAll() {
    return this.vaccineCountriesService.findAll();
  }

  @Get('vaccine/:vaccineId')
  @ApiOperation({ summary: 'Get all countries for a vaccine' })
  @ApiParam({ name: 'vaccineId', description: 'Vaccine UUID' })
  @ApiResponse({ status: 200, description: 'List of countries for the vaccine' })
  findByVaccine(@Param('vaccineId') vaccineId: string) {
    return this.vaccineCountriesService.findByVaccine(vaccineId);
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get all vaccines for a country' })
  @ApiParam({ name: 'countryCode', description: 'Country code (ISO 3166-1 alpha-2)', example: 'DZ' })
  @ApiResponse({ status: 200, description: 'List of vaccines for the country' })
  findByCountry(@Param('countryCode') countryCode: string) {
    return this.vaccineCountriesService.findByCountry(countryCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vaccine-country association by ID' })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association details' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  findOne(@Param('id') id: string) {
    return this.vaccineCountriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vaccine-country association' })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association updated successfully' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() dto: UpdateVaccineCountryDto) {
    return this.vaccineCountriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vaccine-country association' })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association deleted successfully' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  remove(@Param('id') id: string) {
    return this.vaccineCountriesService.remove(id);
  }
}
