import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductType } from '@prisma/client';
import { ProductsService, PaginatedResponse } from './products.service';
import { CreateProductDto, CreateGlobalProductDto, UpdateProductDto, QueryProductDto, ProductResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for managing Products (PHASE_15 - Scope Pattern)
 * Supports both farm-scoped (local) and global (admin) products
 * Dual endpoint structure:
 * - api/v1/farms/:farmId/products - Local products (farm-scoped)
 * - api/v1/products - Global products (admin)
 */
@ApiTags('Products')
@Controller('api/v1')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // =============================================================================
  // Farm-scoped endpoints (local products)
  // =============================================================================

  @Post('farms/:farmId/products')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a local product for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: ProductResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Param('farmId') farmId: string,
    @Body() createDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(farmId, createDto);
  }

  @Get('farms/:farmId/products')
  @ApiOperation({ summary: 'Get all products for a farm with pagination, filters, search, and sorting' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
  @ApiQuery({ name: 'scope', required: false, enum: ['global', 'local', 'all'], description: 'Filter by scope (default: all)', example: 'all' })
  @ApiQuery({ name: 'type', required: false, enum: ProductType, description: 'Filter by product type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'vaccinesOnly', required: false, description: 'Filter vaccines only', example: false })
  @ApiQuery({ name: 'search', required: false, description: 'Search in names', example: 'vaccine' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field (default: nameFr)', example: 'nameFr' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: asc)', example: 'asc' })
  @ApiResponse({ status: 200, description: 'Products list with pagination metadata' })
  async findAll(
    @Param('farmId') farmId: string,
    @Query() query: QueryProductDto,
  ): Promise<PaginatedResponse> {
    return this.productsService.findAll(farmId, query);
  }

  @Get('farms/:farmId/products/vaccines')
  @ApiOperation({ summary: 'Get all vaccines for a farm (convenience endpoint)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Vaccines list with pagination metadata' })
  findVaccines(
    @Param('farmId') farmId: string,
    @Query() query: QueryProductDto,
  ): Promise<PaginatedResponse> {
    return this.productsService.findVaccines(farmId, query);
  }

  @Get('farms/:farmId/products/search')
  @ApiOperation({ summary: 'Search products by name (autocomplete)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'term', description: 'Search term' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 10)' })
  @ApiResponse({ status: 200, description: 'List of matching products' })
  async search(
    @Param('farmId') farmId: string,
    @Query('term') term: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.productsService.search(farmId, term, limit);
  }

  @Get('farms/:farmId/products/type/:type')
  @ApiOperation({ summary: 'Get products by type' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'type', description: 'Product type', enum: ProductType })
  @ApiResponse({ status: 200, description: 'List of products of the specified type' })
  findByType(
    @Param('farmId') farmId: string,
    @Param('type', new ParseEnumPipe(ProductType)) type: ProductType,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.findByType(farmId, type);
  }

  @Get('farms/:farmId/products/:id')
  @ApiOperation({ summary: 'Get a product by ID (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product found', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(farmId, id);
  }

  @Patch('farms/:farmId/products/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a local product (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot modify global products' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(farmId, id, updateDto);
  }

  @Delete('farms/:farmId/products/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a local product (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product soft deleted successfully', type: ProductResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete global products' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.remove(farmId, id);
  }

  @Post('farms/:farmId/products/:id/restore')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted local product (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product restored successfully', type: ProductResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Product is not deleted' })
  restore(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.restore(farmId, id);
  }

  // =============================================================================
  // Global endpoints (admin)
  // =============================================================================

  @Get('products')
  @ApiOperation({ summary: 'Get all global products with pagination, filters, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
  @ApiQuery({ name: 'type', required: false, enum: ProductType, description: 'Filter by product type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'vaccinesOnly', required: false, description: 'Filter vaccines only', example: false })
  @ApiQuery({ name: 'search', required: false, description: 'Search in names', example: 'vaccine' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field (default: nameFr)', example: 'nameFr' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: asc)', example: 'asc' })
  @ApiResponse({ status: 200, description: 'Global products list with pagination metadata' })
  async findAllGlobal(@Query() query: QueryProductDto): Promise<PaginatedResponse> {
    return this.productsService.findAllGlobal(query);
  }

  @Get('products/search')
  @ApiOperation({ summary: 'Search global products by name (autocomplete)' })
  @ApiQuery({ name: 'term', description: 'Search term' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default: 10)' })
  @ApiResponse({ status: 200, description: 'List of matching global products' })
  async searchGlobal(
    @Query('term') term: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.productsService.searchGlobal(term, limit);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get a global product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Global product found', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOneGlobal(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOneGlobal(id);
  }

  @Post('admin/products')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a global product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Global product created successfully', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  createGlobal(@Body() createDto: CreateGlobalProductDto): Promise<ProductResponseDto> {
    return this.productsService.createGlobal(createDto);
  }

  @Post('admin/products/:id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted global product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Global product restored successfully', type: ProductResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Product is not deleted' })
  restoreGlobal(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.restoreGlobal(id);
  }
}
