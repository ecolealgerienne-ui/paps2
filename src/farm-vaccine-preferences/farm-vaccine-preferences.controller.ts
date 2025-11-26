import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FarmVaccinePreferencesService } from './farm-vaccine-preferences.service';
import { CreateFarmVaccinePreferenceDto, UpdateFarmVaccinePreferenceDto } from './dto';

@ApiTags('farm-vaccine-preferences')
@Controller('farms/:farmId/vaccine-preferences')
export class FarmVaccinePreferencesController {
  constructor(private readonly farmVaccinePreferencesService: FarmVaccinePreferencesService) {}

  @Post()
  @ApiOperation({ summary: 'Create farm vaccine preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Preference created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - duplicate preference' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateFarmVaccinePreferenceDto) {
    return this.farmVaccinePreferencesService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vaccine preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'List of preferences for the farm' })
  findByFarm(@Param('farmId') farmId: string) {
    return this.farmVaccinePreferencesService.findByFarm(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get farm vaccine preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference details' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(@Param('id') id: string) {
    return this.farmVaccinePreferencesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update farm vaccine preference' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() dto: UpdateFarmVaccinePreferenceDto) {
    return this.farmVaccinePreferencesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete farm vaccine preference' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference deleted successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(@Param('id') id: string) {
    return this.farmVaccinePreferencesService.remove(id);
  }
}
