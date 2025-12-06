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
import { FarmAlertTemplatePreferencesService } from './farm-alert-template-preferences.service';
import {
  AddFarmAlertTemplatePreferenceDto,
  UpdateFarmAlertTemplatePreferenceDto,
  FarmAlertTemplatePreferenceResponseDto,
  ReorderFarmAlertTemplatePreferenceDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Farm Alert Template Preferences')
@Controller('api/v1/farms/:farmId/alert-template-preferences')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FarmAlertTemplatePreferencesController {
  constructor(private readonly service: FarmAlertTemplatePreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alert template preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive preferences', example: false })
  @ApiResponse({ status: 200, description: 'List of alert template preferences', type: [FarmAlertTemplatePreferenceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findByFarm(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<FarmAlertTemplatePreferenceResponseDto[]> {
    return this.service.findByFarm(farmId, includeInactive === true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific alert template preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference details', type: FarmAlertTemplatePreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmAlertTemplatePreferenceResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add an alert template preference to a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Preference created successfully', type: FarmAlertTemplatePreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm or alert template not found' })
  @ApiResponse({ status: 409, description: 'Preference already exists' })
  add(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: AddFarmAlertTemplatePreferenceDto,
  ): Promise<FarmAlertTemplatePreferenceResponseDto> {
    return this.service.add(farmId, dto.alertTemplateId, dto.reminderDays);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an alert template preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully', type: FarmAlertTemplatePreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmAlertTemplatePreferenceDto,
  ): Promise<FarmAlertTemplatePreferenceResponseDto> {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle active status of an alert template preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiQuery({ name: 'isActive', description: 'Active status', type: 'boolean', required: true })
  @ApiResponse({ status: 200, description: 'Preference status toggled successfully', type: FarmAlertTemplatePreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  toggleActive(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', ParseBoolPipe) isActive: boolean,
  ): Promise<FarmAlertTemplatePreferenceResponseDto> {
    return this.service.toggleActive(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an alert template preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference soft deleted successfully', type: FarmAlertTemplatePreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmAlertTemplatePreferenceResponseDto> {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted alert template preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference restored successfully', type: FarmAlertTemplatePreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Preference is not deleted' })
  restore(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmAlertTemplatePreferenceResponseDto> {
    return this.service.restore(id);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder alert template preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Preferences reordered successfully', type: [FarmAlertTemplatePreferenceResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid preference IDs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  reorder(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: ReorderFarmAlertTemplatePreferenceDto,
  ): Promise<FarmAlertTemplatePreferenceResponseDto[]> {
    return this.service.reorder(farmId, dto.orderedIds);
  }
}
