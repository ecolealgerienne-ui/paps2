import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AlertTemplatesService, PaginatedResponse } from './alert-templates.service';
import {
  CreateAlertTemplateDto,
  UpdateAlertTemplateDto,
  AlertTemplateResponseDto,
  ToggleActiveDto,
} from './dto';
import { AlertCategory, AlertPriority } from '@prisma/client';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Alert Templates')
@Controller('api/v1/alert-templates')
export class AlertTemplatesController {
  constructor(private readonly alertTemplatesService: AlertTemplatesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an alert template (Admin only)' })
  @ApiResponse({ status: 201, description: 'Template created successfully', type: AlertTemplateResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  create(@Body() createDto: CreateAlertTemplateDto): Promise<AlertTemplateResponseDto> {
    return this.alertTemplatesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alert templates with pagination, filters, and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'category', required: false, enum: AlertCategory, description: 'Filter by category' })
  @ApiQuery({ name: 'priority', required: false, enum: AlertPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in names and code' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['nameFr', 'nameEn', 'code', 'category', 'priority', 'createdAt'] })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'List of alert templates with pagination' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: AlertCategory,
    @Query('priority') priority?: AlertPriority,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.alertTemplatesService.findAll({ page, limit, category, priority, isActive, search, orderBy, order });
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Find alert templates by category' })
  @ApiParam({ name: 'category', description: 'Alert category', enum: AlertCategory })
  @ApiResponse({ status: 200, description: 'Templates found', type: [AlertTemplateResponseDto] })
  findByCategory(@Param('category') category: AlertCategory): Promise<AlertTemplateResponseDto[]> {
    return this.alertTemplatesService.findByCategory(category);
  }

  @Get('priority/:priority')
  @ApiOperation({ summary: 'Find alert templates by priority' })
  @ApiParam({ name: 'priority', description: 'Alert priority', enum: AlertPriority })
  @ApiResponse({ status: 200, description: 'Templates found', type: [AlertTemplateResponseDto] })
  findByPriority(@Param('priority') priority: AlertPriority): Promise<AlertTemplateResponseDto[]> {
    return this.alertTemplatesService.findByPriority(priority);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Find alert template by code' })
  @ApiParam({ name: 'code', description: 'Template code', example: 'vaccination_due' })
  @ApiResponse({ status: 200, description: 'Template found', type: AlertTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findByCode(@Param('code') code: string): Promise<AlertTemplateResponseDto> {
    return this.alertTemplatesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Template found', type: AlertTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string): Promise<AlertTemplateResponseDto> {
    return this.alertTemplatesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update alert template (Admin only)' })
  @ApiParam({ name: 'id', description: 'Template ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Template updated successfully', type: AlertTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAlertTemplateDto): Promise<AlertTemplateResponseDto> {
    return this.alertTemplatesService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle active status of alert template (Admin only)' })
  @ApiParam({ name: 'id', description: 'Template ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Active status toggled successfully', type: AlertTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  toggleActive(@Param('id') id: string, @Body() toggleDto: ToggleActiveDto): Promise<AlertTemplateResponseDto> {
    return this.alertTemplatesService.toggleActive(id, toggleDto.isActive);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete alert template (Admin only)' })
  @ApiParam({ name: 'id', description: 'Template ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully', type: AlertTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  remove(@Param('id') id: string): Promise<AlertTemplateResponseDto> {
    return this.alertTemplatesService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore soft-deleted alert template (Admin only)' })
  @ApiParam({ name: 'id', description: 'Template ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Template restored successfully', type: AlertTemplateResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found or not deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  restore(@Param('id') id: string): Promise<AlertTemplateResponseDto> {
    return this.alertTemplatesService.restore(id);
  }
}
