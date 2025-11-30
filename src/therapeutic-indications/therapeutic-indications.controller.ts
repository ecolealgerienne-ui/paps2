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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  TherapeuticIndicationsService,
  PaginatedResponse,
} from './therapeutic-indications.service';
import {
  CreateTherapeuticIndicationDto,
  UpdateTherapeuticIndicationDto,
  QueryTherapeuticIndicationDto,
  TherapeuticIndicationResponseDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for managing Therapeutic Indications (PHASE_10)
 * Contains dosage and withdrawal times for product/species/route combinations
 */
@ApiTags('Therapeutic Indications')
@Controller('api/v1/therapeutic-indications')
export class TherapeuticIndicationsController {
  constructor(private readonly indicationsService: TherapeuticIndicationsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a therapeutic indication (Admin only)' })
  @ApiResponse({ status: 201, description: 'Indication created successfully', type: TherapeuticIndicationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product, species, or route not found' })
  create(@Body() createDto: CreateTherapeuticIndicationDto): Promise<TherapeuticIndicationResponseDto> {
    return this.indicationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all indications with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'speciesId', required: false, description: 'Filter by species ID' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'Filter by country code' })
  @ApiQuery({ name: 'routeId', required: false, description: 'Filter by route ID' })
  @ApiQuery({ name: 'isVerified', required: false, description: 'Filter verified only', example: true })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiResponse({ status: 200, description: 'Indications list with pagination metadata' })
  findAll(@Query() query: QueryTherapeuticIndicationDto): Promise<PaginatedResponse> {
    return this.indicationsService.findAll(query);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get indications for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'List of indications for the product' })
  findByProduct(@Param('productId', ParseUUIDPipe) productId: string): Promise<TherapeuticIndicationResponseDto[]> {
    return this.indicationsService.findByProduct(productId);
  }

  @Get('match')
  @ApiOperation({ summary: 'Find best matching indication for treatment (priority: country+age > country > age > universal)' })
  @ApiQuery({ name: 'productId', required: true, description: 'Product UUID' })
  @ApiQuery({ name: 'speciesId', required: true, description: 'Species UUID' })
  @ApiQuery({ name: 'routeId', required: true, description: 'Route UUID' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'Country code (e.g., "DZ")' })
  @ApiQuery({ name: 'ageCategoryId', required: false, description: 'Age category UUID' })
  @ApiResponse({ status: 200, description: 'Best matching indication', type: TherapeuticIndicationResponseDto })
  @ApiResponse({ status: 200, description: 'No matching indication found (returns null)' })
  findForTreatment(
    @Query('productId') productId: string,
    @Query('speciesId') speciesId: string,
    @Query('routeId') routeId: string,
    @Query('countryCode') countryCode?: string,
    @Query('ageCategoryId') ageCategoryId?: string,
  ): Promise<TherapeuticIndicationResponseDto | null> {
    return this.indicationsService.findForTreatment(
      productId,
      speciesId,
      routeId,
      countryCode,
      ageCategoryId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get indication by ID' })
  @ApiParam({ name: 'id', description: 'Indication UUID' })
  @ApiResponse({ status: 200, description: 'Indication found', type: TherapeuticIndicationResponseDto })
  @ApiResponse({ status: 404, description: 'Indication not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TherapeuticIndicationResponseDto> {
    return this.indicationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an indication (Admin only)' })
  @ApiParam({ name: 'id', description: 'Indication UUID' })
  @ApiResponse({ status: 200, description: 'Indication updated successfully', type: TherapeuticIndicationResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Indication not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTherapeuticIndicationDto,
  ): Promise<TherapeuticIndicationResponseDto> {
    return this.indicationsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an indication (soft delete, Admin only)' })
  @ApiParam({ name: 'id', description: 'Indication UUID' })
  @ApiResponse({ status: 200, description: 'Indication soft deleted successfully', type: TherapeuticIndicationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Indication not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<TherapeuticIndicationResponseDto> {
    return this.indicationsService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted indication (Admin only)' })
  @ApiParam({ name: 'id', description: 'Indication UUID' })
  @ApiResponse({ status: 200, description: 'Indication restored successfully', type: TherapeuticIndicationResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Indication not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Indication is not deleted' })
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<TherapeuticIndicationResponseDto> {
    return this.indicationsService.restore(id);
  }
}
