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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { VeterinariansService } from './veterinarians.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

/**
 * Controller for Veterinarians (Master Table Pattern)
 * Supports both global (admin) and local (farm-specific) veterinarians
 */
@ApiTags('veterinarians')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('farms/:farmId/veterinarians')
export class VeterinariansController {
  constructor(private readonly veterinariansService: VeterinariansService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a local veterinarian',
    description: 'Creates a new veterinarian with scope=local for the specified farm',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Veterinarian created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: CreateVeterinarianDto,
  ) {
    return this.veterinariansService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all veterinarians',
    description: 'Returns global veterinarians + farm local veterinarians. Use scope filter to narrow results.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of veterinarians with meta information',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query() query: QueryVeterinarianDto,
  ) {
    return this.veterinariansService.findAll(farmId, query);
  }

  @Get('search/department/:dept')
  @ApiOperation({
    summary: 'Search veterinarians by department',
    description: 'Returns global veterinarians in a specific department (useful for discovery)',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'dept', description: 'Department code (e.g., "81", "2A")' })
  @ApiResponse({ status: 200, description: 'List of veterinarians in department' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByDepartment(@Param('dept') department: string) {
    return this.veterinariansService.findByDepartment(department);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active veterinarians for a farm',
    description: 'Returns all active global + local veterinarians accessible to this farm',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'List of active veterinarians' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByFarm(@Param('farmId', ParseUUIDPipe) farmId: string) {
    return this.veterinariansService.findByFarm(farmId);
  }

  @Get('default')
  @ApiOperation({
    summary: 'Get default veterinarian for a farm',
    description: 'Returns the default veterinarian set for this farm',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Default veterinarian details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No default veterinarian found' })
  findDefault(@Param('farmId', ParseUUIDPipe) farmId: string) {
    return this.veterinariansService.findDefault(farmId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a veterinarian by ID',
    description: 'Returns a global veterinarian or a local veterinarian belonging to this farm',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.veterinariansService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a veterinarian',
    description: 'Updates a local veterinarian. Global veterinarians are read-only.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot modify global veterinarians' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  @ApiResponse({ status: 409, description: 'Version conflict (optimistic locking)' })
  update(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVeterinarianDto,
  ) {
    return this.veterinariansService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a veterinarian (soft delete)',
    description: 'Soft deletes a local veterinarian. Global veterinarians cannot be deleted.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian soft deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot delete global veterinarians' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.veterinariansService.remove(farmId, id);
  }

  @Patch(':id/set-default')
  @ApiOperation({
    summary: 'Set a veterinarian as default for the farm',
    description: 'Sets the specified local veterinarian as default. Only local veterinarians can be set as default.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Veterinarian UUID' })
  @ApiResponse({ status: 200, description: 'Veterinarian set as default' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Veterinarian not found' })
  setDefault(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.veterinariansService.setDefault(farmId, id);
  }
}
