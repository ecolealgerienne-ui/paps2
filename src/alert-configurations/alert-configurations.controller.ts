import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AlertConfigurationsService } from './alert-configurations.service';
import { CreateAlertConfigurationDto, UpdateAlertConfigurationDto, QueryAlertConfigurationDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('Alert Configurations')
@Controller('farms/:farmId/alert-configurations')
@UseGuards(AuthGuard, FarmGuard)
export class AlertConfigurationsController {
  constructor(private readonly alertConfigurationsService: AlertConfigurationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alert configuration (Admin only)' })
  @ApiResponse({ status: 201, description: 'Alert configuration created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(
    @Param('farmId') farmId: string,
    @Body() dto: CreateAlertConfigurationDto,
  ) {
    return this.alertConfigurationsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List alert configurations' })
  findAll(
    @Param('farmId') farmId: string,
    @Query() query: QueryAlertConfigurationDto,
  ) {
    return this.alertConfigurationsService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert configuration by ID' })
  findOne(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
  ) {
    return this.alertConfigurationsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update alert configuration' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAlertConfigurationDto,
  ) {
    return this.alertConfigurationsService.update(farmId, id, dto);
  }
}
