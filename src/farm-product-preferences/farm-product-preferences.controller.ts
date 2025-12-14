import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Put,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FarmProductPreferencesService } from './farm-product-preferences.service';
import {
  CreateFarmProductPreferenceDto,
  UpdateFarmProductPreferenceDto,
  UpdateProductConfigDto,
  FarmProductPreferenceResponseDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Farm Product Preferences')
@Controller('api/v1/farms/:farmId/product-preferences')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FarmProductPreferencesController {
  constructor(private readonly service: FarmProductPreferencesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product preference for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Preference created successfully', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm or product not found' })
  @ApiResponse({ status: 409, description: 'Product preference already exists' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: CreateFarmProductPreferenceDto,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive preferences', example: false })
  @ApiResponse({ status: 200, description: 'List of product preferences', type: [FarmProductPreferenceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findByFarm(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<FarmProductPreferenceResponseDto[]> {
    return this.service.findByFarm(farmId, includeInactive === true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference details', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFarmProductPreferenceDto,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle active status of a preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiQuery({ name: 'isActive', description: 'Active status', type: 'boolean', required: true })
  @ApiResponse({ status: 200, description: 'Preference status toggled successfully', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  toggleActive(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', ParseBoolPipe) isActive: boolean,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.toggleActive(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a product preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference soft deleted successfully', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted product preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference restored successfully', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Preference is not deleted' })
  restore(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.restore(id);
  }

  // ============================================================
  // CONFIGURATION PERSONNALISÉE (surcharge AMM/RCP)
  // ============================================================

  @Get(':id/config')
  @ApiOperation({ summary: 'Get custom configuration of a product preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Config with lots and userDefined fields', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  getConfig(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.getConfig(farmId, id);
  }

  @Put(':id/config')
  @ApiOperation({ summary: 'Update custom configuration (override AMM/RCP values)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Config updated successfully', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error (dose without unit)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  updateConfig(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductConfigDto,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.updateConfig(farmId, id, dto);
  }

  @Delete(':id/config')
  @ApiOperation({ summary: 'Reset custom configuration (set all userDefined* to NULL)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Config reset to NULL values', type: FarmProductPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  resetConfig(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmProductPreferenceResponseDto> {
    return this.service.resetConfig(farmId, id);
  }
}
