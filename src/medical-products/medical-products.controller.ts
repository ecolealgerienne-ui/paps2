import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicalProductsService } from './medical-products.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('medical-products')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('medical-products')
export class MedicalProductsController {
  constructor(private readonly medicalProductsService: MedicalProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a medical product' })
  @ApiResponse({ status: 201, description: 'Medical product created' })
  create(@Body() dto: CreateMedicalProductDto) {
    return this.medicalProductsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical products' })
  @ApiResponse({ status: 200, description: 'List of medical products' })
  findAll(@Query() query: QueryMedicalProductDto) {
    return this.medicalProductsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medical product by ID' })
  @ApiResponse({ status: 200, description: 'Medical product details' })
  findOne(@Param('id') id: string) {
    return this.medicalProductsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a medical product' })
  @ApiResponse({ status: 200, description: 'Medical product updated' })
  update(@Param('id') id: string, @Body() dto: UpdateMedicalProductDto) {
    return this.medicalProductsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medical product' })
  @ApiResponse({ status: 200, description: 'Medical product deleted' })
  remove(@Param('id') id: string) {
    return this.medicalProductsService.remove(id);
  }
}
