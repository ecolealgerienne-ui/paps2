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
import { AgeCategoriesService, PaginatedResponse } from './age-categories.service';
import {
  CreateAgeCategoryDto,
  UpdateAgeCategoryDto,
  AgeCategoryResponseDto,
  ToggleActiveDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Age Categories')
@Controller('api/v1/age-categories')
export class AgeCategoriesController {
  constructor(private readonly categoriesService: AgeCategoriesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an age category (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: AgeCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 409, description: 'Duplicate code for this species' })
  create(@Body() createDto: CreateAgeCategoryDto): Promise<AgeCategoryResponseDto> {
    return this.categoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all age categories with pagination, filters, and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'speciesId', required: false, type: String, description: 'Filter by species ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in names and code (case-insensitive)' })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['nameFr', 'nameEn', 'code', 'ageMinDays', 'displayOrder', 'createdAt'],
    description: 'Field to sort by',
  })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of age categories with pagination metadata',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/AgeCategoryResponseDto' } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('speciesId') speciesId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.categoriesService.findAll({
      page,
      limit,
      speciesId,
      isActive,
      search,
      orderBy,
      order,
    });
  }

  @Get('species/:speciesId')
  @ApiOperation({ summary: 'Get active age categories for a species (sorted by displayOrder)' })
  @ApiParam({ name: 'speciesId', description: 'Species ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'List of active age categories for the species',
    type: [AgeCategoryResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Species not found' })
  findBySpecies(@Param('speciesId') speciesId: string): Promise<AgeCategoryResponseDto[]> {
    return this.categoriesService.findBySpecies(speciesId);
  }

  @Get('match')
  @ApiOperation({
    summary: 'Find matching age category for an animal based on species and age in days',
    description: 'Returns the age category that matches the given age, or default category if no match',
  })
  @ApiQuery({ name: 'speciesId', required: true, description: 'Species ID (UUID)' })
  @ApiQuery({ name: 'ageInDays', required: true, type: Number, description: 'Age in days' })
  @ApiResponse({
    status: 200,
    description: 'Matching age category',
    type: AgeCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No matching category found and no default set' })
  findForAnimalAge(
    @Query('speciesId') speciesId: string,
    @Query('ageInDays') ageInDays: number,
  ): Promise<AgeCategoryResponseDto | null> {
    return this.categoriesService.findForAnimalAge(speciesId, Number(ageInDays));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get age category by ID' })
  @ApiParam({ name: 'id', description: 'Age category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Age category details',
    type: AgeCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Age category not found' })
  findOne(@Param('id') id: string): Promise<AgeCategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an age category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Age category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: AgeCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Age category not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAgeCategoryDto,
  ): Promise<AgeCategoryResponseDto> {
    return this.categoriesService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle active status of an age category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Age category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Active status toggled successfully',
    type: AgeCategoryResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Age category not found' })
  toggleActive(
    @Param('id') id: string,
    @Body() toggleDto: ToggleActiveDto,
  ): Promise<AgeCategoryResponseDto> {
    return this.categoriesService.toggleActive(id, toggleDto.isActive);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an age category (Admin only, soft delete)' })
  @ApiParam({ name: 'id', description: 'Age category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully (soft delete)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Age category deleted successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Age category not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete - category is in use' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoriesService.remove(id);
    return { message: 'Age category deleted successfully' };
  }
}
