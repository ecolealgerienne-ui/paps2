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
import { AdministrationRoutesService, PaginatedResponse } from './administration-routes.service';
import {
  CreateAdministrationRouteDto,
  UpdateAdministrationRouteDto,
  AdministrationRouteResponseDto,
  ToggleActiveDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Administration Routes')
@Controller('api/v1/administration-routes')
export class AdministrationRoutesController {
  constructor(private readonly administrationRoutesService: AdministrationRoutesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an administration route (Admin only)' })
  @ApiResponse({ status: 201, description: 'Route created successfully', type: AdministrationRouteResponseDto })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  create(@Body() createDto: CreateAdministrationRouteDto): Promise<AdministrationRouteResponseDto> {
    return this.administrationRoutesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all administration routes with pagination, filters, and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in names, code, and abbreviation' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['nameFr', 'nameEn', 'code', 'abbreviation', 'displayOrder', 'createdAt'] })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'List of administration routes with pagination' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.administrationRoutesService.findAll({ page, limit, isActive, search, orderBy, order });
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Find administration route by code' })
  @ApiParam({ name: 'code', description: 'Route code', example: 'oral' })
  @ApiResponse({ status: 200, description: 'Route found', type: AdministrationRouteResponseDto })
  @ApiResponse({ status: 404, description: 'Route not found' })
  findByCode(@Param('code') code: string): Promise<AdministrationRouteResponseDto> {
    return this.administrationRoutesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get administration route by ID' })
  @ApiParam({ name: 'id', description: 'Route ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Route found', type: AdministrationRouteResponseDto })
  @ApiResponse({ status: 404, description: 'Route not found' })
  findOne(@Param('id') id: string): Promise<AdministrationRouteResponseDto> {
    return this.administrationRoutesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update administration route (Admin only)' })
  @ApiParam({ name: 'id', description: 'Route ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Route updated successfully', type: AdministrationRouteResponseDto })
  @ApiResponse({ status: 404, description: 'Route not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  update(@Param('id') id: string, @Body() updateDto: UpdateAdministrationRouteDto): Promise<AdministrationRouteResponseDto> {
    return this.administrationRoutesService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle active status of administration route (Admin only)' })
  @ApiParam({ name: 'id', description: 'Route ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Active status toggled successfully', type: AdministrationRouteResponseDto })
  @ApiResponse({ status: 404, description: 'Route not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  toggleActive(@Param('id') id: string, @Body() toggleDto: ToggleActiveDto): Promise<AdministrationRouteResponseDto> {
    return this.administrationRoutesService.toggleActive(id, toggleDto.isActive);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete administration route (Admin only)' })
  @ApiParam({ name: 'id', description: 'Route ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Route deleted successfully', type: AdministrationRouteResponseDto })
  @ApiResponse({ status: 404, description: 'Route not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete: route is in use by treatments or therapeutic indications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  remove(@Param('id') id: string): Promise<AdministrationRouteResponseDto> {
    return this.administrationRoutesService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore soft-deleted administration route (Admin only)' })
  @ApiParam({ name: 'id', description: 'Route ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Route restored successfully', type: AdministrationRouteResponseDto })
  @ApiResponse({ status: 404, description: 'Route not found or not deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  restore(@Param('id') id: string): Promise<AdministrationRouteResponseDto> {
    return this.administrationRoutesService.restore(id);
  }
}
