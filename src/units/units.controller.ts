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
import { UnitsService, PaginatedResponse } from './units.service';
import {
  CreateUnitDto,
  UpdateUnitDto,
  UnitResponseDto,
  ToggleActiveDto,
} from './dto';
import { UnitType } from '@prisma/client';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Units')
@Controller('api/v1/units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a unit (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Unit created successfully',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  create(@Body() createDto: CreateUnitDto): Promise<UnitResponseDto> {
    return this.unitsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units with pagination, filters, and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'unitType', required: false, enum: UnitType, description: 'Filter by unit type' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in names, code, and symbol (case-insensitive)' })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['nameFr', 'nameEn', 'code', 'symbol', 'unitType', 'displayOrder', 'createdAt'],
    description: 'Field to sort by',
  })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of units with pagination metadata',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/UnitResponseDto' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unitType') unitType?: UnitType,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.unitsService.findAll({
      page,
      limit,
      unitType,
      isActive,
      search,
      orderBy,
      order,
    });
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get active units by type (sorted by displayOrder)' })
  @ApiParam({ name: 'type', enum: UnitType, description: 'Unit type' })
  @ApiResponse({
    status: 200,
    description: 'List of active units for the type',
    type: [UnitResponseDto],
  })
  findByType(@Param('type') type: UnitType): Promise<UnitResponseDto[]> {
    return this.unitsService.findByType(type);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get unit by code' })
  @ApiParam({ name: 'code', description: 'Unit code (e.g., mg, ml, kg)' })
  @ApiResponse({
    status: 200,
    description: 'Unit details',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  findByCode(@Param('code') code: string): Promise<UnitResponseDto> {
    return this.unitsService.findByCode(code);
  }

  @Get('convert')
  @ApiOperation({
    summary: 'Convert value between units',
    description: 'Converts a value from one unit to another. Units must be of the same type and have conversion factors defined.',
  })
  @ApiQuery({ name: 'value', required: true, type: Number, description: 'Value to convert', example: 1000 })
  @ApiQuery({ name: 'from', required: true, type: String, description: 'Source unit code', example: 'mg' })
  @ApiQuery({ name: 'to', required: true, type: String, description: 'Target unit code', example: 'g' })
  @ApiResponse({
    status: 200,
    description: 'Conversion result',
    schema: {
      type: 'object',
      properties: {
        value: { type: 'number', example: 1000 },
        from: { type: 'string', example: 'mg' },
        to: { type: 'string', example: 'g' },
        result: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 409, description: 'Incompatible unit types' })
  async convert(
    @Query('value') value: number,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<{ value: number; from: string; to: string; result: number }> {
    const result = await this.unitsService.convert(Number(value), from, to);
    return { value: Number(value), from, to, result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({
    status: 200,
    description: 'Unit details',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  findOne(@Param('id') id: string): Promise<UnitResponseDto> {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a unit (Admin only)' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({
    status: 200,
    description: 'Unit updated successfully',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUnitDto,
  ): Promise<UnitResponseDto> {
    return this.unitsService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle active status of a unit (Admin only)' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({
    status: 200,
    description: 'Active status toggled successfully',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  toggleActive(
    @Param('id') id: string,
    @Body() toggleDto: ToggleActiveDto,
  ): Promise<UnitResponseDto> {
    return this.unitsService.toggleActive(id, toggleDto.isActive);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a unit (Admin only, soft delete)' })
  @ApiParam({ name: 'id', description: 'Unit UUID' })
  @ApiResponse({
    status: 200,
    description: 'Unit deleted successfully (soft delete)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unit deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete - unit is in use' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.unitsService.remove(id);
    return { message: 'Unit deleted successfully' };
  }
}
