import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdministrationRoutesService } from './administration-routes.service';
import { CreateAdministrationRouteDto } from './dto/create-administration-route.dto';
import { UpdateAdministrationRouteDto } from './dto/update-administration-route.dto';

@ApiTags('administration-routes')
@Controller('administration-routes')
export class AdministrationRoutesController {
  constructor(private readonly service: AdministrationRoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new administration route' })
  @ApiResponse({ status: 201, description: 'Administration route created successfully' })
  @ApiResponse({ status: 409, description: 'Administration route with this code already exists' })
  create(@Body() dto: CreateAdministrationRouteDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all administration routes' })
  @ApiResponse({ status: 200, description: 'List of administration routes' })
  findAll(@Query('includeDeleted') includeDeleted?: string) {
    return this.service.findAll(includeDeleted === 'true');
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Find administration route by code' })
  @ApiResponse({ status: 200, description: 'Administration route found' })
  @ApiResponse({ status: 404, description: 'Administration route not found' })
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get administration route by ID' })
  @ApiResponse({ status: 200, description: 'Administration route found' })
  @ApiResponse({ status: 404, description: 'Administration route not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update administration route' })
  @ApiResponse({ status: 200, description: 'Administration route updated successfully' })
  @ApiResponse({ status: 404, description: 'Administration route not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(@Param('id') id: string, @Body() dto: UpdateAdministrationRouteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete administration route' })
  @ApiResponse({ status: 200, description: 'Administration route deleted successfully' })
  @ApiResponse({ status: 404, description: 'Administration route not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete: route is in use' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted administration route' })
  @ApiResponse({ status: 200, description: 'Administration route restored successfully' })
  @ApiResponse({ status: 404, description: 'Administration route not found' })
  @ApiResponse({ status: 409, description: 'Administration route is not deleted' })
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }
}
