import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SpeciesService, PaginatedResponse } from './species.service';
import { CreateSpeciesDto, UpdateSpeciesDto } from './dto';
import { SpeciesResponseDto } from './dto/species-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for species reference data
 * PHASE_02: Added pagination, search, sort, Guards, removed custom wrapper
 */
@ApiTags('Species')
@Controller('api/v1/species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new species (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Species created successfully',
    type: SpeciesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Species already exists' })
  create(@Body() createDto: CreateSpeciesDto): Promise<SpeciesResponseDto> {
    return this.speciesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all species with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in names (Fr/En/Ar) and scientific name',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['nameFr', 'nameEn', 'id', 'displayOrder', 'createdAt'],
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of species',
  })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.speciesService.findAll({ page, limit, search, orderBy, order });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a species by ID' })
  @ApiResponse({
    status: 200,
    description: 'Species found',
    type: SpeciesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Species not found' })
  findOne(@Param('id') id: string): Promise<SpeciesResponseDto> {
    return this.speciesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a species (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Species updated successfully',
    type: SpeciesResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSpeciesDto,
  ): Promise<SpeciesResponseDto> {
    return this.speciesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a species (Admin only)' })
  @ApiResponse({ status: 204, description: 'Species soft deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  @ApiResponse({ status: 409, description: 'Species is used by active breeds' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.speciesService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted species (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Species restored successfully',
    type: SpeciesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  @ApiResponse({ status: 409, description: 'Species is not deleted' })
  restore(@Param('id') id: string): Promise<SpeciesResponseDto> {
    return this.speciesService.restore(id);
  }
}
