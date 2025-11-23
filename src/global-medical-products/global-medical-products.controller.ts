import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MedicalProductType } from './types/medical-product-type.enum';
import { GlobalMedicalProductsService } from './global-medical-products.service';
import { CreateGlobalMedicalProductDto } from './dto/create-global-medical-product.dto';
import { UpdateGlobalMedicalProductDto } from './dto/update-global-medical-product.dto';

@ApiTags('global-medical-products')
@Controller('global-medical-products')
export class GlobalMedicalProductsController {
  constructor(private readonly service: GlobalMedicalProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new global medical product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'Product with this code already exists' })
  create(@Body() dto: CreateGlobalMedicalProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all global medical products with optional filters' })
  @ApiQuery({ name: 'type', required: false, enum: MedicalProductType, description: 'Filter by product type' })
  @ApiQuery({ name: 'laboratoire', required: false, type: String, description: 'Filter by laboratory (case-insensitive)' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Include soft-deleted products' })
  @ApiResponse({ status: 200, description: 'List of global medical products' })
  findAll(
    @Query('type') type?: MedicalProductType,
    @Query('laboratoire') laboratoire?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.service.findAll({
      type,
      laboratoire,
      includeDeleted: includeDeleted === 'true',
    });
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Find global medical products by type' })
  @ApiResponse({ status: 200, description: 'Products of specified type' })
  findByType(@Param('type') type: MedicalProductType) {
    return this.service.findByType(type);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Find global medical product by code' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findByCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get global medical product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update global medical product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(@Param('id') id: string, @Body() dto: UpdateGlobalMedicalProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete global medical product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete: product is in use' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted global medical product' })
  @ApiResponse({ status: 200, description: 'Product restored successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product is not deleted' })
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }
}
