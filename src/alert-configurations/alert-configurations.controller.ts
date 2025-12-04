import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AlertConfigurationsService } from './alert-configurations.service';
import {
  CreateAlertConfigurationDto,
  UpdateAlertConfigurationDto,
  AlertConfigurationResponseDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Alert Configurations')
@Controller('api/v1/farms/:farmId/alert-configuration')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AlertConfigurationsController {
  constructor(private readonly alertConfigurationsService: AlertConfigurationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create alert configuration for a farm',
    description: 'Creates alert configuration. Only 1 per farm allowed (farmId @unique).',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Alert configuration created successfully', type: AlertConfigurationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict - Configuration already exists for this farm' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: CreateAlertConfigurationDto,
  ): Promise<AlertConfigurationResponseDto> {
    return this.alertConfigurationsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get alert configuration for a farm',
    description: 'Returns the alert configuration for the specified farm.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Alert configuration found', type: AlertConfigurationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found - No configuration for this farm' })
  findByFarm(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<AlertConfigurationResponseDto> {
    return this.alertConfigurationsService.findByFarm(farmId);
  }

  @Get('or-create')
  @ApiOperation({
    summary: 'Get or create alert configuration for a farm',
    description: 'Returns existing configuration or creates one with default values if none exists.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Alert configuration returned (existing or newly created)', type: AlertConfigurationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOrCreate(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<AlertConfigurationResponseDto> {
    return this.alertConfigurationsService.findOrCreate(farmId);
  }

  @Put()
  @ApiOperation({
    summary: 'Update alert configuration for a farm',
    description: 'Updates the alert configuration. Supports optimistic locking via version field.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Alert configuration updated successfully', type: AlertConfigurationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found - No configuration for this farm' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch (optimistic locking)' })
  update(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: UpdateAlertConfigurationDto,
  ): Promise<AlertConfigurationResponseDto> {
    return this.alertConfigurationsService.update(farmId, dto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Soft delete alert configuration for a farm',
    description: 'Soft deletes the alert configuration (sets deletedAt timestamp).',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Alert configuration soft deleted successfully', type: AlertConfigurationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found - No configuration for this farm' })
  remove(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<AlertConfigurationResponseDto> {
    return this.alertConfigurationsService.remove(farmId);
  }

  @Post('restore')
  @ApiOperation({
    summary: 'Restore a soft-deleted alert configuration',
    description: 'Restores a previously soft-deleted alert configuration.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Alert configuration restored successfully', type: AlertConfigurationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found - No configuration for this farm' })
  @ApiResponse({ status: 409, description: 'Conflict - Configuration is not deleted' })
  restore(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<AlertConfigurationResponseDto> {
    return this.alertConfigurationsService.restore(farmId);
  }
}
