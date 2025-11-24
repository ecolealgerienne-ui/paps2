import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductCountriesService } from './product-countries.service';
import { CreateProductCountryDto, UpdateProductCountryDto } from './dto';

@ApiTags('product-countries')
@Controller('api/v1/product-countries')
export class ProductCountriesController {
  constructor(private readonly service: ProductCountriesService) {}

  @Post()
  @ApiOperation({ summary: 'Associer un produit à un pays' })
  @ApiResponse({ status: 201, description: 'Association created' })
  @ApiResponse({ status: 404, description: 'Product or country not found' })
  @ApiResponse({ status: 409, description: 'Association already exists' })
  create(@Body() dto: CreateProductCountryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste toutes les associations produit-pays' })
  @ApiResponse({ status: 200, description: 'List of product-country associations' })
  findAll() {
    return this.service.findAll();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Liste des pays d\'un produit (PHASE_17)' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Countries for this product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findCountriesByProduct(@Param('productId') productId: string) {
    return this.service.findCountriesByProduct(productId);
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Liste des produits d\'un pays (PHASE_17)' })
  @ApiParam({ name: 'countryCode', description: 'Country code (ISO 3166-1 alpha-2)' })
  @ApiResponse({ status: 200, description: 'Products for this country' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findProductsByCountry(@Param('countryCode') countryCode: string) {
    return this.service.findProductsByCountry(countryCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'une association' })
  @ApiResponse({ status: 200, description: 'Association details' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une association' })
  @ApiResponse({ status: 200, description: 'Association updated' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProductCountryDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activer/désactiver une association' })
  @ApiResponse({ status: 200, description: 'Association status toggled' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  toggleActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.service.toggleActive(id, isActive);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une association' })
  @ApiResponse({ status: 200, description: 'Association deleted' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
