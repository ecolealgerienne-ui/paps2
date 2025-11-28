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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto, QueryProductCategoryDto } from './dto';

@ApiTags('Product Categories')
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(@Body() createDto: CreateProductCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product categories' })
  findAll(@Query() query: QueryProductCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get category by code' })
  @ApiParam({ name: 'code', description: 'Category code (e.g., antibiotics)' })
  findByCode(@Param('code') code: string) {
    return this.categoriesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(@Param('id') id: string, @Body() updateDto: UpdateProductCategoryDto) {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a category (soft delete)' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
