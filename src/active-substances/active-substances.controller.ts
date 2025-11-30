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
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ActiveSubstancesService, PaginatedResponse } from './active-substances.service';
import { CreateActiveSubstanceDto, UpdateActiveSubstanceDto } from './dto';
import { ActiveSubstanceResponseDto } from './dto/active-substance-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for active substances reference data
 * PHASE_02: Added pagination, search, sort, Guards, restore endpoint
 */
@ApiTags('Active Substances')
@Controller('api/v1/active-substances')
export class ActiveSubstancesController {
  constructor(private readonly substancesService: ActiveSubstancesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new active substance (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Substance created successfully',
    type: ActiveSubstanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Substance code already exists' })
  create(@Body() createDto: CreateActiveSubstanceDto): Promise<ActiveSubstanceResponseDto> {
    return this.substancesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active substances with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in code, name, nameFr/En/Ar',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['name', 'code', 'atcCode', 'createdAt'],
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of active substances',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.substancesService.findAll({
      page,
      limit,
      isActive,
      search,
      orderBy,
      order,
    });
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get substance by code' })
  @ApiParam({ name: 'code', description: 'Substance code', example: 'amoxicillin' })
  @ApiResponse({
    status: 200,
    description: 'Substance found',
    type: ActiveSubstanceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Substance not found' })
  findByCode(@Param('code') code: string): Promise<ActiveSubstanceResponseDto> {
    return this.substancesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get substance by ID' })
  @ApiResponse({
    status: 200,
    description: 'Substance found',
    type: ActiveSubstanceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Substance not found' })
  findOne(@Param('id') id: string): Promise<ActiveSubstanceResponseDto> {
    return this.substancesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a substance (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Substance updated successfully',
    type: ActiveSubstanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Substance not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateActiveSubstanceDto,
  ): Promise<ActiveSubstanceResponseDto> {
    return this.substancesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a substance (Admin only)' })
  @ApiResponse({ status: 204, description: 'Substance soft deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Substance not found' })
  @ApiResponse({ status: 409, description: 'Substance is used by active products' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.substancesService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted substance (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Substance restored successfully',
    type: ActiveSubstanceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Substance not found' })
  @ApiResponse({ status: 409, description: 'Substance is not deleted' })
  restore(@Param('id') id: string): Promise<ActiveSubstanceResponseDto> {
    return this.substancesService.restore(id);
  }
}
