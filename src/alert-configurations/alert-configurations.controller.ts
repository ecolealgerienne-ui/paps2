import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AlertConfigurationsService } from './alert-configurations.service';
import { CreateAlertConfigurationDto, UpdateAlertConfigurationDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

/**
 * Controller for Alert Configurations (PHASE_14)
 * Gère 1 configuration unique par ferme
 */
@ApiTags('Alert Configurations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('farms/:farmId/alert-configuration')
export class AlertConfigurationsController {
  constructor(private readonly alertConfigurationsService: AlertConfigurationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create alert configuration for a farm (PHASE_14)',
    description: 'Creates alert configuration. Only 1 per farm allowed (farmId @unique).',
  })
  @ApiResponse({ status: 201, description: 'Alert configuration created successfully' })
  @ApiResponse({ status: 409, description: 'Conflict - Configuration already exists for this farm' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  create(
    @Param('farmId') farmId: string,
    @Body() dto: CreateAlertConfigurationDto,
  ) {
    return this.alertConfigurationsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get alert configuration for a farm (PHASE_14)',
    description: 'Returns the alert configuration for the specified farm.',
  })
  @ApiResponse({ status: 200, description: 'Alert configuration found' })
  @ApiResponse({ status: 404, description: 'Not found - No configuration for this farm' })
  findByFarm(@Param('farmId') farmId: string) {
    return this.alertConfigurationsService.findByFarm(farmId);
  }

  @Get('or-create')
  @ApiOperation({
    summary: 'Get or create alert configuration for a farm (PHASE_14)',
    description: 'Returns existing configuration or creates one with default values if none exists.',
  })
  @ApiResponse({ status: 200, description: 'Alert configuration returned (existing or newly created)' })
  findOrCreate(@Param('farmId') farmId: string) {
    return this.alertConfigurationsService.findOrCreate(farmId);
  }

  @Put()
  @ApiOperation({
    summary: 'Update alert configuration for a farm (PHASE_14)',
    description: 'Updates the alert configuration. Supports optimistic locking via version field.',
  })
  @ApiResponse({ status: 200, description: 'Alert configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Not found - No configuration for this farm' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch (optimistic locking)' })
  update(
    @Param('farmId') farmId: string,
    @Body() dto: UpdateAlertConfigurationDto,
  ) {
    return this.alertConfigurationsService.update(farmId, dto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Soft delete alert configuration for a farm (PHASE_14)',
    description: 'Soft deletes the alert configuration (sets deletedAt timestamp).',
  })
  @ApiResponse({ status: 200, description: 'Alert configuration soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Not found - No configuration for this farm' })
  remove(@Param('farmId') farmId: string) {
    return this.alertConfigurationsService.remove(farmId);
  }
}
