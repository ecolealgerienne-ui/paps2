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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, CreateGlobalProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { ProductType } from '../common/types/prisma-types';

@ApiTags('Products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // =============================================================================
  // Farm-scoped endpoints (local products)
  // =============================================================================

  @Post('farms/:farmId/products')
  @ApiOperation({ summary: 'Create a local product for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(
    @Param('farmId') farmId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(farmId, createProductDto);
  }

  @Get('farms/:farmId/products')
  @ApiOperation({ summary: 'Get all products accessible to a farm (global + local)' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(
    @Param('farmId') farmId: string,
    @Query() query: QueryProductDto,
  ) {
    return this.productsService.findAll(farmId, query);
  }

  @Get('farms/:farmId/products/vaccines')
  @ApiOperation({ summary: 'Get vaccines only (type=vaccine)' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  findVaccines(
    @Param('farmId') farmId: string,
    @Query() query: QueryProductDto,
  ) {
    return this.productsService.findVaccines(farmId, query);
  }

  @Get('farms/:farmId/products/search')
  @ApiOperation({ summary: 'Search products by name (autocomplete)' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiQuery({ name: 'limit', description: 'Max results', required: false })
  search(
    @Param('farmId') farmId: string,
    @Query('q') term: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.search(farmId, term, limit);
  }

  @Get('farms/:farmId/products/type/:type')
  @ApiOperation({ summary: 'Get products by type' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiParam({ name: 'type', description: 'Product type', enum: ProductType })
  findByType(
    @Param('farmId') farmId: string,
    @Param('type') type: ProductType,
  ) {
    return this.productsService.findByType(farmId, type);
  }

  @Get('farms/:farmId/products/:id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(farmId, id);
  }

  @Patch('farms/:farmId/products/:id')
  @ApiOperation({ summary: 'Update a local product' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 403, description: 'Cannot modify global products' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(farmId, id, updateProductDto);
  }

  @Delete('farms/:farmId/products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a local product (soft delete)' })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 403, description: 'Cannot delete global products' })
  remove(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(farmId, id);
  }

  // =============================================================================
  // Global endpoints (admin)
  // =============================================================================

  @Get('products')
  @ApiOperation({ summary: 'Get all global products (no farm scope required)' })
  @ApiResponse({ status: 200, description: 'Global products retrieved successfully' })
  findAllGlobal(@Query() query: QueryProductDto) {
    return this.productsService.findAllGlobal(query);
  }

  @Get('products/search')
  @ApiOperation({ summary: 'Search global products by name (autocomplete)' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiQuery({ name: 'limit', description: 'Max results', required: false })
  searchGlobal(
    @Query('q') term: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.searchGlobal(term, limit);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get a global product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOneGlobal(@Param('id') id: string) {
    return this.productsService.findOneGlobal(id);
  }

  @Post('admin/products')
  @ApiOperation({ summary: 'Create a global product (admin only)' })
  @ApiResponse({ status: 201, description: 'Global product created successfully' })
  createGlobal(@Body() createGlobalProductDto: CreateGlobalProductDto) {
    return this.productsService.createGlobal(createGlobalProductDto);
  }
}
