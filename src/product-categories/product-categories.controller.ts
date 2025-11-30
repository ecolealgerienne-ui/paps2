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
import { ProductCategoriesService, FindAllOptions, PaginatedResponse } from './product-categories.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto, ProductCategoryResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Product Categories')
@Controller('api/v1/product-categories')
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: ProductCategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 409, description: 'Conflict - Code already exists' })
  create(@Body() createDto: CreateProductCategoryDto): Promise<ProductCategoryResponseDto> {
    return this.categoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product categories with pagination, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20, max: 100)', example: 20 })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'search', required: false, description: 'Search in code and names', example: 'antibiotic' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Field to sort by (nameFr, nameEn, code, displayOrder, createdAt)', example: 'nameFr' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (ASC or DESC)', example: 'ASC' })
  @ApiResponse({ status: 200, description: 'Categories list with pagination metadata' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.categoriesService.findAll({ page, limit, isActive, search, orderBy, order });
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get category by code' })
  @ApiParam({ name: 'code', description: 'Category code (e.g., antibiotics)' })
  @ApiResponse({ status: 200, description: 'Category found', type: ProductCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findByCode(@Param('code') code: string): Promise<ProductCategoryResponseDto> {
    return this.categoriesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category found', type: ProductCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string): Promise<ProductCategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: ProductCategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch' })
  update(@Param('id') id: string, @Body() updateDto: UpdateProductCategoryDto): Promise<ProductCategoryResponseDto> {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully', type: ProductCategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Category is used by active products' })
  remove(@Param('id') id: string): Promise<ProductCategoryResponseDto> {
    return this.categoriesService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted category (Admin only)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category restored successfully', type: ProductCategoryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Category is not deleted' })
  restore(@Param('id') id: string): Promise<ProductCategoryResponseDto> {
    return this.categoriesService.restore(id);
  }
}
