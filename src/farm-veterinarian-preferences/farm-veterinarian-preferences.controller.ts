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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FarmVeterinarianPreferencesService } from './farm-veterinarian-preferences.service';
import { CreateFarmVeterinarianPreferenceDto, UpdateFarmVeterinarianPreferenceDto, FarmVeterinarianPreferenceResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Farm Veterinarian Preferences')
@Controller('api/v1/farms/:farmId/veterinarian-preferences')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FarmVeterinarianPreferencesController {
  constructor(private readonly farmVeterinarianPreferencesService: FarmVeterinarianPreferencesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a veterinarian to farm preferences' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Preference created successfully', type: FarmVeterinarianPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm or veterinarian not found' })
  @ApiResponse({ status: 409, description: 'Veterinarian already in preferences' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: CreateFarmVeterinarianPreferenceDto,
  ): Promise<FarmVeterinarianPreferenceResponseDto> {
    return this.farmVeterinarianPreferencesService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all veterinarian preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive preferences', example: false })
  @ApiResponse({ status: 200, description: 'List of farm veterinarian preferences', type: [FarmVeterinarianPreferenceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findByFarm(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<FarmVeterinarianPreferenceResponseDto[]> {
    return this.farmVeterinarianPreferencesService.findByFarm(farmId, includeInactive === true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific farm veterinarian preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Farm veterinarian preference details', type: FarmVeterinarianPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmVeterinarianPreferenceResponseDto> {
    return this.farmVeterinarianPreferencesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a farm veterinarian preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully', type: FarmVeterinarianPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmVeterinarianPreferenceDto,
  ): Promise<FarmVeterinarianPreferenceResponseDto> {
    return this.farmVeterinarianPreferencesService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle active status of a farm veterinarian preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiQuery({ name: 'isActive', description: 'Active status', type: 'boolean', required: true })
  @ApiResponse({ status: 200, description: 'Preference status toggled successfully', type: FarmVeterinarianPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  toggleActive(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', ParseBoolPipe) isActive: boolean,
  ): Promise<FarmVeterinarianPreferenceResponseDto> {
    return this.farmVeterinarianPreferencesService.toggleActive(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a veterinarian from farm preferences' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference soft deleted successfully', type: FarmVeterinarianPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmVeterinarianPreferenceResponseDto> {
    return this.farmVeterinarianPreferencesService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted veterinarian preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference restored successfully', type: FarmVeterinarianPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Preference is not deleted' })
  restore(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmVeterinarianPreferenceResponseDto> {
    return this.farmVeterinarianPreferencesService.restore(id);
  }
}
