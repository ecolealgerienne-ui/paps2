import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
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
import { VeterinariansService, PaginatedResponse } from './veterinarians.service';
import {
  CreateVeterinarianDto,
  CreateGlobalVeterinarianDto,
  UpdateVeterinarianDto,
  QueryVeterinarianDto,
  VeterinarianResponseDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for managing Veterinarians (PHASE_16 - Scope Pattern)
 * Supports both farm-scoped (local) and global (admin) veterinarians
 * Dual endpoint structure:
 * - api/v1/farms/:farmId/veterinarians - Local veterinarians (farm-scoped)
 * - api/v1/veterinarians - Global veterinarians (admin)
 */
@ApiTags('Veterinarians')
@Controller('api/v1')
export class VeterinariansController {
  constructor(private readonly veterinariansService: VeterinariansService) {}

  // =============================================================================
  // Farm-scoped endpoints (local veterinarians)
  // =============================================================================

  @Post('farms/:farmId/veterinarians')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a local veterinarian for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Veterinarian created successfully', type: VeterinarianResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() createDto: CreateVeterinarianDto,
  ): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.create(farmId, createDto);
  }

  @Get('farms/:farmId/veterinarians')
  @ApiOperation({ summary: 'Get all veterinarians for a farm with pagination, filters, search, and sorting' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
  @ApiQuery({ name: 'scope', required: false, enum: ['global', 'local', 'all'], description: 'Filter by scope (default: all)', example: 'all' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department code' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'isAvailable', required: false, description: 'Filter by availability', example: true })
  @ApiQuery({ name: 'emergencyService', required: false, description: 'Filter by emergency service availability', example: false })
  @ApiQuery({ name: 'search', required: false, description: 'Search in names', example: 'dupont' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field (default: lastName)', example: 'lastName' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: asc)', example: 'asc' })
  @ApiResponse({ status: 200, description: 'Veterinarians list with pagination metadata' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query() query: QueryVeterinarianDto,
  ): Promise<PaginatedResponse> {
    return this.veterinariansService.findAll(farmId, query);
  }

  @Get('farms/:farmId/veterinarians/active')
  @ApiOperation({ summary: 'Get active veterinarians for a farm (convenience endpoint)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'List of active veterinarians' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByFarm(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<VeterinarianResponseDto[]> {
    return this.veterinariansService.findByFarm(farmId);
  }

  @Get('farms/:farmId/veterinarians/default')
  @ApiOperation({ summary: 'Get default veterinarian for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Default veterinarian details', type: VeterinarianResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No default veterinarian found' })
  findDefault(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<VeterinarianResponseDto | null> {
    return this.veterinariansService.findDefault(farmId);
  }

  @Get('farms/:farmId/veterinarians/:id')
  @ApiOperation({ summary: 'Get a veterinarian by ID (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian found', type: VeterinarianResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.findOne(farmId, id);
  }

  @Put('farms/:farmId/veterinarians/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a local veterinarian (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian updated successfully', type: VeterinarianResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot modify global veterinarians' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch' })
  update(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateVeterinarianDto,
  ): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.update(farmId, id, updateDto);
  }

  @Patch('farms/:farmId/veterinarians/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Partially update a local veterinarian (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian updated successfully', type: VeterinarianResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot modify global veterinarians' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch' })
  partialUpdate(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateVeterinarianDto,
  ): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.update(farmId, id, updateDto);
  }

  @Delete('farms/:farmId/veterinarians/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a local veterinarian (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian soft deleted successfully', type: VeterinarianResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete global veterinarians' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.remove(farmId, id);
  }

  @Post('farms/:farmId/veterinarians/:id/restore')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted local veterinarian (farm-scoped)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian restored successfully', type: VeterinarianResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Veterinarian is not deleted' })
  restore(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.restore(farmId, id);
  }

  @Patch('farms/:farmId/veterinarians/:id/set-default')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set a veterinarian as default for the farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian set as default', type: VeterinarianResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  setDefault(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.setDefault(farmId, id);
  }

  // =============================================================================
  // Global endpoints (admin)
  // =============================================================================

  @Get('veterinarians')
  @ApiOperation({ summary: 'Get all global veterinarians with pagination, filters, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department code' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'isAvailable', required: false, description: 'Filter by availability', example: true })
  @ApiQuery({ name: 'emergencyService', required: false, description: 'Filter by emergency service availability', example: false })
  @ApiQuery({ name: 'search', required: false, description: 'Search in names', example: 'dupont' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field (default: lastName)', example: 'lastName' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: asc)', example: 'asc' })
  @ApiResponse({ status: 200, description: 'Global veterinarians list with pagination metadata' })
  async findAllGlobal(@Query() query: QueryVeterinarianDto): Promise<PaginatedResponse> {
    return this.veterinariansService.findAllGlobal(query);
  }

  @Get('veterinarians/search/department/:dept')
  @ApiOperation({ summary: 'Search global veterinarians by department (discovery endpoint)' })
  @ApiParam({ name: 'dept', description: 'Department code (e.g., "81", "2A")' })
  @ApiResponse({ status: 200, description: 'List of veterinarians in department' })
  findByDepartment(@Param('dept') department: string): Promise<VeterinarianResponseDto[]> {
    return this.veterinariansService.findByDepartment(department);
  }

  @Get('veterinarians/:id')
  @ApiOperation({ summary: 'Get a global veterinarian by ID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Global veterinarian found', type: VeterinarianResponseDto })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  findOneGlobal(@Param('id', ParseUUIDPipe) id: string): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.findOneGlobal(id);
  }

  @Post('admin/veterinarians')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a global veterinarian (Admin only)' })
  @ApiResponse({ status: 201, description: 'Global veterinarian created successfully', type: VeterinarianResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  createGlobal(@Body() createDto: CreateGlobalVeterinarianDto): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.createGlobal(createDto);
  }

  @Post('admin/veterinarians/:id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted global veterinarian (Admin only)' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Global veterinarian restored successfully', type: VeterinarianResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Veterinarian is not deleted' })
  restoreGlobal(@Param('id', ParseUUIDPipe) id: string): Promise<VeterinarianResponseDto> {
    return this.veterinariansService.restoreGlobal(id);
  }
}
