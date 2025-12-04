import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FarmSpeciesPreferencesService } from './farm-species-preferences.service';
import {
  AddFarmSpeciesPreferenceDto,
  UpdateFarmSpeciesPreferenceDto,
  FarmSpeciesPreferenceResponseDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Farm Species Preferences')
@Controller('api/v1/farms/:farmId/species-preferences')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FarmSpeciesPreferencesController {
  constructor(private readonly service: FarmSpeciesPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all species preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive preferences', example: false })
  @ApiResponse({ status: 200, description: 'List of species preferences', type: [FarmSpeciesPreferenceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findByFarm(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<FarmSpeciesPreferenceResponseDto[]> {
    return this.service.findByFarm(farmId, includeInactive === true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific species preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference details', type: FarmSpeciesPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmSpeciesPreferenceResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a species preference to a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Preference created successfully', type: FarmSpeciesPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm or species not found' })
  @ApiResponse({ status: 409, description: 'Preference already exists' })
  add(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: AddFarmSpeciesPreferenceDto,
  ): Promise<FarmSpeciesPreferenceResponseDto> {
    return this.service.add(farmId, dto.speciesId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a species preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully', type: FarmSpeciesPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmSpeciesPreferenceDto,
  ): Promise<FarmSpeciesPreferenceResponseDto> {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle active status of a species preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiQuery({ name: 'isActive', description: 'Active status', type: 'boolean', required: true })
  @ApiResponse({ status: 200, description: 'Preference status toggled successfully', type: FarmSpeciesPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  toggleActive(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', ParseBoolPipe) isActive: boolean,
  ): Promise<FarmSpeciesPreferenceResponseDto> {
    return this.service.toggleActive(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a species preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference soft deleted successfully', type: FarmSpeciesPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmSpeciesPreferenceResponseDto> {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted species preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference restored successfully', type: FarmSpeciesPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Preference is not deleted' })
  restore(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmSpeciesPreferenceResponseDto> {
    return this.service.restore(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder species preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Preferences reordered successfully', type: [FarmSpeciesPreferenceResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid preference IDs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  reorder(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: { orderedIds: string[] },
  ): Promise<FarmSpeciesPreferenceResponseDto[]> {
    return this.service.reorder(farmId, dto.orderedIds);
  }
}
