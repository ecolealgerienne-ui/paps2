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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MedicalProductsService } from './medical-products.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('medical-products')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('farms/:farmId/medical-products')
export class MedicalProductsController {
  constructor(private readonly medicalProductsService: MedicalProductsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a local medical product',
    description: 'Creates a new medical product with scope=local for the specified farm',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Medical product created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: CreateMedicalProductDto,
  ) {
    return this.medicalProductsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all medical products',
    description: 'Returns global products + farm local products. Use scope filter to narrow results.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of medical products with meta information',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query() query: QueryMedicalProductDto,
  ) {
    return this.medicalProductsService.findAll(farmId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a medical product by ID',
    description: 'Returns a global product or a local product belonging to this farm',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Medical product UUID' })
  @ApiResponse({ status: 200, description: 'Medical product details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Medical product not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.medicalProductsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a medical product',
    description: 'Updates a local product. Global products are read-only.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Medical product UUID' })
  @ApiResponse({ status: 200, description: 'Medical product updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot modify global products' })
  @ApiResponse({ status: 404, description: 'Medical product not found' })
  update(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicalProductDto,
  ) {
    return this.medicalProductsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a medical product (soft delete)',
    description: 'Soft deletes a local product. Global products cannot be deleted.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Medical product UUID' })
  @ApiResponse({ status: 200, description: 'Medical product soft deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot delete global products' })
  @ApiResponse({ status: 404, description: 'Medical product not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.medicalProductsService.remove(farmId, id);
  }
}
