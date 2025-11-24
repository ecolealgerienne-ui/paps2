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
@Controller()
export class FarmVeterinarianPreferencesController {
  constructor(private readonly farmVeterinarianPreferencesService: FarmVeterinarianPreferencesService) {}

  @Post('farms/:farmId/veterinarian-preferences')
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

  @Get('farm-veterinarian-preferences')
  @ApiOperation({ summary: 'Get all farm veterinarian preferences' })
  @ApiResponse({ status: 200, description: 'List of all preferences' })
  findAll() {
    return this.farmVeterinarianPreferencesService.findAll();
  }

  @Get('farms/:farmId/veterinarian-preferences')
  @ApiOperation({ summary: 'Get all veterinarian preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of farm veterinarian preferences' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findByFarm(@Param('farmId', ParseUUIDPipe) farmId: string) {
    return this.farmVeterinarianPreferencesService.findByFarm(farmId);
  }

  @Get('farm-veterinarian-preferences/:id')
  @ApiOperation({ summary: 'Get a specific farm veterinarian preference' })
  @ApiParam({ name: 'id', description: 'Preference ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Farm veterinarian preference details' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.farmVeterinarianPreferencesService.findOne(id);
  }

  @Patch('farm-veterinarian-preferences/:id')
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

  @Delete('farm-veterinarian-preferences/:id')
  @ApiOperation({ summary: 'Remove a veterinarian from farm preferences' })
  @ApiParam({ name: 'id', description: 'Preference ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Preference deleted successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.farmVeterinarianPreferencesService.remove(id);
  }

  @Patch('farm-veterinarian-preferences/:id/toggle-active')
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

  @Put('farms/:farmId/veterinarian-preferences/reorder')
  @ApiOperation({ summary: 'Reorder veterinarian preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Preferences reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid preference IDs' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  reorder(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() body: { orderedIds: string[] },
  ) {
    return this.farmVeterinarianPreferencesService.reorder(farmId, body.orderedIds);
  }
}
