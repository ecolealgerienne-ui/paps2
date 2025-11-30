import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
import { BreedsService, FindAllOptions, PaginatedResponse } from './breeds.service';
import { CreateBreedDto, UpdateBreedDto, BreedResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Breeds')
@Controller('api/v1/breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new breed (Admin only)' })
  @ApiResponse({ status: 201, description: 'Breed created successfully', type: BreedResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 409, description: 'Conflict - Code already exists' })
  create(@Body() createDto: CreateBreedDto): Promise<BreedResponseDto> {
    return this.breedsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all breeds with pagination, filters, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20, max: 100)', example: 20 })
  @ApiQuery({ name: 'speciesId', required: false, description: 'Filter by species ID' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'search', required: false, description: 'Search in code, names, and description', example: 'holstein' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Field to sort by (nameFr, nameEn, code, displayOrder, createdAt)', example: 'nameFr' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (ASC or DESC)', example: 'ASC' })
  @ApiResponse({ status: 200, description: 'Breeds list with pagination metadata' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('speciesId') speciesId?: string,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.breedsService.findAll({ page, limit, speciesId, isActive, search, orderBy, order });
  }

  @Get('species/:speciesId')
  @ApiOperation({ summary: 'Get breeds by species (uses composite index)' })
  @ApiParam({ name: 'speciesId', description: 'Species ID' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Filter only active breeds (default: true)',
    example: true,
  })
  @ApiResponse({ status: 200, description: 'Breeds list for the specified species', type: [BreedResponseDto] })
  async findBySpecies(
    @Param('speciesId') speciesId: string,
    @Query('activeOnly', new ParseBoolPipe({ optional: true })) activeOnly?: boolean,
  ): Promise<BreedResponseDto[]> {
    const active = activeOnly !== undefined ? activeOnly : true;
    return this.breedsService.findBySpecies(speciesId, active);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get breed by code' })
  @ApiParam({ name: 'code', description: 'Breed code (e.g., holstein)' })
  @ApiResponse({ status: 200, description: 'Breed found', type: BreedResponseDto })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  findByCode(@Param('code') code: string): Promise<BreedResponseDto> {
    return this.breedsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a breed by ID' })
  @ApiParam({ name: 'id', description: 'Breed UUID' })
  @ApiResponse({ status: 200, description: 'Breed found', type: BreedResponseDto })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  findOne(@Param('id') id: string): Promise<BreedResponseDto> {
    return this.breedsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a breed (Admin only)' })
  @ApiParam({ name: 'id', description: 'Breed UUID' })
  @ApiResponse({ status: 200, description: 'Breed updated successfully', type: BreedResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch' })
  update(@Param('id') id: string, @Body() updateDto: UpdateBreedDto): Promise<BreedResponseDto> {
    return this.breedsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a breed (Admin only)' })
  @ApiParam({ name: 'id', description: 'Breed UUID' })
  @ApiResponse({ status: 200, description: 'Breed deleted successfully', type: BreedResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Breed is used by active animals' })
  remove(@Param('id') id: string): Promise<BreedResponseDto> {
    return this.breedsService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted breed (Admin only)' })
  @ApiParam({ name: 'id', description: 'Breed UUID' })
  @ApiResponse({ status: 200, description: 'Breed restored successfully', type: BreedResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Breed is not deleted' })
  restore(@Param('id') id: string): Promise<BreedResponseDto> {
    return this.breedsService.restore(id);
  }
}
