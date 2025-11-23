import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AlertCategory } from './types/alert-category.enum';
import { AlertPriority } from './types/alert-priority.enum';
import { AlertTemplatesService } from './alert-templates.service';
import { CreateAlertTemplateDto } from './dto/create-alert-template.dto';
import { UpdateAlertTemplateDto } from './dto/update-alert-template.dto';

@ApiTags('alert-templates')
@Controller('alert-templates')
export class AlertTemplatesController {
  constructor(private readonly service: AlertTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new alert template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 409, description: 'Template with this code already exists' })
  create(@Body() dto: CreateAlertTemplateDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alert templates with optional filters' })
  @ApiQuery({ name: 'category', required: false, enum: AlertCategory, description: 'Filter by category' })
  @ApiQuery({ name: 'priority', required: false, enum: AlertPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Include soft-deleted templates' })
  @ApiResponse({ status: 200, description: 'List of alert templates' })
  findAll(
    @Query('category') category?: AlertCategory,
    @Query('priority') priority?: AlertPriority,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.service.findAll({
      category,
      priority,
      includeDeleted: includeDeleted === 'true',
    });
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Find alert templates by category' })
  @ApiResponse({ status: 200, description: 'Templates of specified category' })
  findByCategory(@Param('category') category: AlertCategory) {
    return this.service.findByCategory(category);
  }

  @Get('priority/:priority')
  @ApiOperation({ summary: 'Find alert templates by priority' })
  @ApiResponse({ status: 200, description: 'Templates of specified priority' })
  findByPriority(@Param('priority') priority: AlertPriority) {
    return this.service.findByPriority(priority);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Find alert template by code' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert template by ID' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update alert template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(@Param('id') id: string, @Body() dto: UpdateAlertTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete alert template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted alert template' })
  @ApiResponse({ status: 200, description: 'Template restored successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 409, description: 'Template is not deleted' })
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }
}
