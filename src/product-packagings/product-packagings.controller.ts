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
import { ProductPackagingsService } from './product-packagings.service';
import { CreateProductPackagingDto, UpdateProductPackagingDto, QueryProductPackagingDto } from './dto';

@ApiTags('Product Packagings')
@Controller('product-packagings')
export class ProductPackagingsController {
  constructor(private readonly packagingsService: ProductPackagingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product packaging' })
  @ApiResponse({ status: 201, description: 'Packaging created successfully' })
  create(@Body() createDto: CreateProductPackagingDto) {
    return this.packagingsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all packagings with filters' })
  @ApiResponse({ status: 200, description: 'Packagings retrieved successfully' })
  findAll(@Query() query: QueryProductPackagingDto) {
    return this.packagingsService.findAll(query);
  }

  @Get('scan/:gtin')
  @ApiOperation({ summary: 'Find packaging by GTIN/EAN barcode (for scanning)' })
  @ApiParam({ name: 'gtin', description: 'GTIN/EAN barcode' })
  @ApiResponse({ status: 200, description: 'Packaging found' })
  @ApiResponse({ status: 404, description: 'Packaging not found' })
  findByGtin(@Param('gtin') gtin: string) {
    return this.packagingsService.findByGtin(gtin);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all packagings for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  findByProduct(@Param('productId') productId: string) {
    return this.packagingsService.findByProduct(productId);
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get all packagings available in a country' })
  @ApiParam({ name: 'countryCode', description: 'Country code (ISO 3166-1 alpha-2)' })
  findByCountry(@Param('countryCode') countryCode: string) {
    return this.packagingsService.findByCountry(countryCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a packaging by ID' })
  @ApiParam({ name: 'id', description: 'Packaging ID' })
  findOne(@Param('id') id: string) {
    return this.packagingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a packaging' })
  @ApiParam({ name: 'id', description: 'Packaging ID' })
  @ApiResponse({ status: 200, description: 'Packaging updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductPackagingDto,
  ) {
    return this.packagingsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a packaging (soft delete)' })
  @ApiParam({ name: 'id', description: 'Packaging ID' })
  @ApiResponse({ status: 204, description: 'Packaging deleted successfully' })
  remove(@Param('id') id: string) {
    return this.packagingsService.remove(id);
  }
}
