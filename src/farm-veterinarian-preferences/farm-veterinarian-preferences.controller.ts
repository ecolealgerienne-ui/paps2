import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  ParseBoolPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FarmVeterinarianPreferencesService } from './farm-veterinarian-preferences.service';
import { CreateFarmVeterinarianPreferenceDto, UpdateFarmVeterinarianPreferenceDto } from './dto';

@ApiTags('Farm Veterinarian Preferences')
@Controller('farms/:farmId/veterinarian-preferences')
export class FarmVeterinarianPreferencesController {
  constructor(private readonly farmVeterinarianPreferencesService: FarmVeterinarianPreferencesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a veterinarian to farm preferences' })
  @ApiParam({ name: 'farmId', description: 'Farm ID', type: 'string' })
  @ApiResponse({ status: 201, description: 'Preference created successfully' })
  @ApiResponse({ status: 404, description: 'Farm or veterinarian not found' })
  @ApiResponse({ status: 409, description: 'Veterinarian already in preferences' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: CreateFarmVeterinarianPreferenceDto,
  ) {
    return this.farmVeterinarianPreferencesService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all veterinarian preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of farm veterinarian preferences' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findByFarm(@Param('farmId', ParseUUIDPipe) farmId: string) {
    return this.farmVeterinarianPreferencesService.findByFarm(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific farm veterinarian preference' })
  @ApiParam({ name: 'id', description: 'Preference ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Farm veterinarian preference details' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.farmVeterinarianPreferencesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a farm veterinarian preference' })
  @ApiParam({ name: 'id', description: 'Preference ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmVeterinarianPreferenceDto,
  ) {
    return this.farmVeterinarianPreferencesService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle active status of a farm veterinarian preference' })
  @ApiParam({ name: 'id', description: 'Preference ID', type: 'string' })
  @ApiQuery({ name: 'isActive', description: 'Active status', type: 'boolean' })
  @ApiResponse({ status: 200, description: 'Preference status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.farmVeterinarianPreferencesService.toggleActive(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a veterinarian from farm preferences' })
  @ApiParam({ name: 'id', description: 'Preference ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Preference deleted successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.farmVeterinarianPreferencesService.remove(id);
  }
}
