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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto, UpdateFarmDto, QueryFarmDto, ToggleActiveFarmDto } from './dto';

@ApiTags('Farms')
@Controller('api/farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new farm (PHASE_03)' })
  @ApiResponse({ status: 201, description: 'Farm created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or geo codes' })
  create(@Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.create(createFarmDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all farms with filters (PHASE_03)' })
  @ApiResponse({ status: 200, description: 'List of farms' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, location, address, or city' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'Filter by owner ID' })
  @ApiQuery({ name: 'groupId', required: false, description: 'Filter by group ID' })
  @ApiQuery({ name: 'isDefault', required: false, description: 'Filter by default status' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department code' })
  @ApiQuery({ name: 'includeDeleted', required: false, description: 'Include deleted farms', type: Boolean })
  findAll(@Query() query: QueryFarmDto) {
    return this.farmsService.findAll(query);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get farms by owner ID (PHASE_03)' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID' })
  @ApiQuery({ name: 'includeDeleted', required: false, description: 'Include deleted farms', type: Boolean })
  @ApiResponse({ status: 200, description: 'List of farms for the owner' })
  findByOwner(
    @Param('ownerId') ownerId: string,
    @Query('includeDeleted') includeDeleted?: string
  ) {
    const withDeleted = includeDeleted === 'true';
    return this.farmsService.findByOwner(ownerId, withDeleted);
  }

  @Get('owner/:ownerId/default')
  @ApiOperation({ summary: 'Get default farm for owner (PHASE_03)' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID' })
  @ApiResponse({ status: 200, description: 'Default farm for the owner' })
  @ApiResponse({ status: 404, description: 'No default farm found' })
  findDefault(@Param('ownerId') ownerId: string) {
    return this.farmsService.findDefault(ownerId);
  }

  @Get('location')
  @ApiOperation({ summary: 'Search farms by geographic location (PHASE_03)' })
  @ApiQuery({ name: 'country', required: false, description: 'Country code (ISO 3166-1 alpha-2)', example: 'FR' })
  @ApiQuery({ name: 'department', required: false, description: 'Department code', example: '81' })
  @ApiResponse({ status: 200, description: 'List of farms matching location criteria' })
  @ApiResponse({ status: 400, description: 'Invalid country or department format' })
  findByLocation(
    @Query('country') country?: string,
    @Query('department') department?: string
  ) {
    return this.farmsService.findByLocation(country, department);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a farm by ID (PHASE_03)',
    description: 'Use ?includeStats=true to include entity counts (slower with large datasets)'
  })
  @ApiParam({ name: 'id', description: 'Farm ID' })
  @ApiQuery({ name: 'includeStats', required: false, description: 'Include statistics counts', type: Boolean })
  @ApiResponse({ status: 200, description: 'Farm details' })
  @ApiResponse({ status: 404, description: 'Farm not found or deleted' })
  findOne(
    @Param('id') id: string,
    @Query('includeStats') includeStats?: string
  ) {
    const withStats = includeStats === 'true';
    return this.farmsService.findOne(id, withStats);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a farm (PHASE_03)' })
  @ApiParam({ name: 'id', description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or geo codes' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch (optimistic locking)' })
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return this.farmsService.update(id, updateFarmDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle farm active status (PHASE_03)' })
  @ApiParam({ name: 'id', description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm active status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Cannot deactivate default farm' })
  toggleActive(@Param('id') id: string, @Body() dto: ToggleActiveFarmDto) {
    return this.farmsService.toggleActive(id, dto.isActive);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a farm (PHASE_03)', description: 'Soft deletes the farm (sets deletedAt timestamp)' })
  @ApiParam({ name: 'id', description: 'Farm ID' })
  @ApiResponse({ status: 200, description: 'Farm soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Cannot delete default farm or farm with active animals' })
  remove(@Param('id') id: string) {
    return this.farmsService.remove(id);
  }
}
