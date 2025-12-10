// src/farm-alerts/farm-alerts.controller.ts

import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FarmAlertsService } from './farm-alerts.service';
import { AlertEngineService } from './alert-engine/alert-engine.service';
import {
  QueryFarmAlertDto,
  UpdateFarmAlertStatusDto,
  FarmAlertResponseDto,
  PaginatedFarmAlertsResponseDto,
  FarmAlertSummaryDto,
  UnreadCountDto,
  BulkUpdateFarmAlertsDto,
  MarkAllAsReadDto,
  BulkUpdateResultDto,
  GenerateAlertsResultDto,
} from './dto';

@ApiTags('Farm Alerts')
@ApiBearerAuth()
@Controller('api/v1/farms/:farmId/alerts')
export class FarmAlertsController {
  constructor(
    private readonly farmAlertsService: FarmAlertsService,
    private readonly alertEngineService: AlertEngineService,
  ) {}

  /**
   * Liste paginée des alertes avec filtres
   */
  @Get()
  @ApiOperation({
    summary: 'Get all alerts for a farm',
    description: 'Returns a paginated list of alerts with optional filters',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of alerts',
    type: PaginatedFarmAlertsResponseDto,
  })
  async findAll(
    @Param('farmId') farmId: string,
    @Query() query: QueryFarmAlertDto,
  ): Promise<PaginatedFarmAlertsResponseDto> {
    return this.farmAlertsService.findAll(farmId, {
      status: query.status,
      category: query.category,
      priority: query.priority,
      animalId: query.animalId,
      lotId: query.lotId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      page: query.page,
      limit: query.limit,
      orderBy: query.orderBy,
      order: query.order,
    });
  }

  /**
   * Résumé des alertes par statut/catégorie/priorité
   */
  @Get('summary')
  @ApiOperation({
    summary: 'Get alert summary for a farm',
    description: 'Returns counts by status, category, and priority',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'Alert summary',
    type: FarmAlertSummaryDto,
  })
  async getSummary(
    @Param('farmId') farmId: string,
  ): Promise<FarmAlertSummaryDto> {
    return this.farmAlertsService.getSummary(farmId);
  }

  /**
   * Compteur d'alertes non lues (endpoint léger pour badge)
   */
  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread alerts count',
    description: 'Returns only the count of pending alerts (lightweight endpoint for badges)',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'Unread count',
    type: UnreadCountDto,
  })
  async getUnreadCount(
    @Param('farmId') farmId: string,
  ): Promise<UnreadCountDto> {
    return this.farmAlertsService.getUnreadCount(farmId);
  }

  /**
   * Détail d'une alerte
   */
  @Get(':alertId')
  @ApiOperation({
    summary: 'Get a single alert',
    description: 'Returns detailed information about a specific alert',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'alertId', description: 'Alert UUID' })
  @ApiResponse({
    status: 200,
    description: 'Alert details',
    type: FarmAlertResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alert not found',
  })
  async findOne(
    @Param('farmId') farmId: string,
    @Param('alertId') alertId: string,
  ): Promise<FarmAlertResponseDto> {
    return this.farmAlertsService.findOne(farmId, alertId);
  }

  /**
   * Mettre à jour le statut d'une alerte
   */
  @Patch(':alertId')
  @ApiOperation({
    summary: 'Update alert status',
    description: 'Updates the status of a specific alert (read, dismissed, resolved)',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'alertId', description: 'Alert UUID' })
  @ApiResponse({
    status: 200,
    description: 'Alert updated',
    type: FarmAlertResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Alert not found',
  })
  async updateStatus(
    @Param('farmId') farmId: string,
    @Param('alertId') alertId: string,
    @Body() dto: UpdateFarmAlertStatusDto,
  ): Promise<FarmAlertResponseDto> {
    return this.farmAlertsService.updateStatus(
      farmId,
      alertId,
      dto.status,
      dto.readOn,
    );
  }

  /**
   * Marquer toutes les alertes comme lues
   */
  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all alerts as read',
    description: 'Marks all pending alerts as read (optionally filtered by category/priority)',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'Alerts marked as read',
    type: BulkUpdateResultDto,
  })
  async markAllAsRead(
    @Param('farmId') farmId: string,
    @Body() dto: MarkAllAsReadDto,
  ): Promise<BulkUpdateResultDto> {
    return this.farmAlertsService.markAllAsRead(
      farmId,
      dto.readOn,
      dto.category,
      dto.priority,
    );
  }

  /**
   * Mise à jour en masse des alertes
   */
  @Post('bulk-update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update alerts',
    description: 'Updates the status of multiple alerts at once',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'Bulk update result',
    type: BulkUpdateResultDto,
  })
  async bulkUpdate(
    @Param('farmId') farmId: string,
    @Body() dto: BulkUpdateFarmAlertsDto,
  ): Promise<BulkUpdateResultDto> {
    return this.farmAlertsService.bulkUpdate(
      farmId,
      dto.alertIds,
      dto.status,
      dto.readOn,
    );
  }

  /**
   * Supprimer une alerte (soft delete)
   */
  @Delete(':alertId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an alert',
    description: 'Soft deletes a specific alert',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'alertId', description: 'Alert UUID' })
  @ApiResponse({
    status: 204,
    description: 'Alert deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Alert not found',
  })
  async remove(
    @Param('farmId') farmId: string,
    @Param('alertId') alertId: string,
  ): Promise<void> {
    return this.farmAlertsService.remove(farmId, alertId);
  }

  /**
   * Forcer la génération des alertes
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate alerts for a farm',
    description: 'Forces regeneration of all alerts based on current farm data',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'Generation result',
    type: GenerateAlertsResultDto,
  })
  async generate(
    @Param('farmId') farmId: string,
  ): Promise<GenerateAlertsResultDto> {
    return this.alertEngineService.generateForFarm(farmId);
  }
}
