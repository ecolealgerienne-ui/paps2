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
import { ProductPackagingsService, FindAllOptions, PaginatedResponse } from './product-packagings.service';
import { CreateProductPackagingDto, UpdateProductPackagingDto, ProductPackagingResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Product Packagings')
@Controller('api/v1/product-packagings')
export class ProductPackagingsController {
  constructor(private readonly packagingsService: ProductPackagingsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product packaging (Admin only)' })
  @ApiResponse({ status: 201, description: 'Packaging created successfully', type: ProductPackagingResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product or country not found' })
  create(@Body() createDto: CreateProductPackagingDto): Promise<ProductPackagingResponseDto> {
    return this.packagingsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all packagings with pagination, filters, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'Filter by country code', example: 'DZ' })
  @ApiQuery({ name: 'gtinEan', required: false, description: 'Filter by GTIN/EAN' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'search', required: false, description: 'Search in packagingLabel, gtinEan, numeroAMM', example: 'flacon' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Field to sort by (packagingLabel, countryCode, concentration, gtinEan, createdAt)', example: 'packagingLabel' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (ASC or DESC)', example: 'ASC' })
  @ApiResponse({ status: 200, description: 'Packagings list with pagination metadata' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('productId') productId?: string,
    @Query('countryCode') countryCode?: string,
    @Query('gtinEan') gtinEan?: string,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.packagingsService.findAll({
      page,
      limit,
      productId,
      countryCode,
      gtinEan,
      isActive,
      search,
      orderBy,
      order
    });
  }

  @Get('scan/:gtin')
  @ApiOperation({ summary: 'Find packaging by GTIN/EAN barcode (for barcode scanning)' })
  @ApiParam({ name: 'gtin', description: 'GTIN/EAN barcode' })
  @ApiResponse({ status: 200, description: 'Packaging found', type: ProductPackagingResponseDto })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  findByGtin(@Param('gtin') gtin: string): Promise<ProductPackagingResponseDto> {
    return this.packagingsService.findByGtin(gtin);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all packagings for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product packagings list', type: [ProductPackagingResponseDto] })
  findByProduct(@Param('productId') productId: string): Promise<ProductPackagingResponseDto[]> {
    return this.packagingsService.findByProduct(productId);
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get all active packagings available in a country' })
  @ApiParam({ name: 'countryCode', description: 'Country code (ISO 3166-1 alpha-2)', example: 'DZ' })
  @ApiResponse({ status: 200, description: 'Country packagings list', type: [ProductPackagingResponseDto] })
  findByCountry(@Param('countryCode') countryCode: string): Promise<ProductPackagingResponseDto[]> {
    return this.packagingsService.findByCountry(countryCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a packaging by ID' })
  @ApiParam({ name: 'id', description: 'Packaging UUID' })
  @ApiResponse({ status: 200, description: 'Packaging found', type: ProductPackagingResponseDto })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  findOne(@Param('id') id: string): Promise<ProductPackagingResponseDto> {
    return this.packagingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a packaging (Admin only)' })
  @ApiParam({ name: 'id', description: 'Packaging UUID' })
  @ApiResponse({ status: 200, description: 'Packaging updated successfully', type: ProductPackagingResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductPackagingDto,
  ): Promise<ProductPackagingResponseDto> {
    return this.packagingsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a packaging (Admin only)' })
  @ApiParam({ name: 'id', description: 'Packaging UUID' })
  @ApiResponse({ status: 200, description: 'Packaging deleted successfully', type: ProductPackagingResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  remove(@Param('id') id: string): Promise<ProductPackagingResponseDto> {
    return this.packagingsService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted packaging (Admin only)' })
  @ApiParam({ name: 'id', description: 'Packaging UUID' })
  @ApiResponse({ status: 200, description: 'Packaging restored successfully', type: ProductPackagingResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Packaging is not deleted' })
  restore(@Param('id') id: string): Promise<ProductPackagingResponseDto> {
    return this.packagingsService.restore(id);
  }
}
