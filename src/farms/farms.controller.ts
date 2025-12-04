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
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto, UpdateFarmDto, QueryFarmDto, ToggleActiveFarmDto, FarmResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Farms')
@Controller('api/v1/farms')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new farm' })
  @ApiResponse({ status: 201, description: 'Farm created successfully', type: FarmResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or geo codes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createFarmDto: CreateFarmDto): Promise<FarmResponseDto> {
    return this.farmsService.create(createFarmDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all farms with filters' })
  @ApiResponse({ status: 200, description: 'List of farms', type: [FarmResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, location, address, or city' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'Filter by owner ID' })
  @ApiQuery({ name: 'groupId', required: false, description: 'Filter by group ID' })
  @ApiQuery({ name: 'isDefault', required: false, description: 'Filter by default status' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1)' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by department code' })
  @ApiQuery({ name: 'includeDeleted', required: false, description: 'Include deleted farms', type: Boolean })
  findAll(@Query() query: QueryFarmDto): Promise<FarmResponseDto[]> {
    return this.farmsService.findAll(query);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get farms by owner ID' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID' })
  @ApiQuery({ name: 'includeDeleted', required: false, description: 'Include deleted farms', type: Boolean })
  @ApiResponse({ status: 200, description: 'List of farms for the owner', type: [FarmResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByOwner(
    @Param('ownerId') ownerId: string,
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<FarmResponseDto[]> {
    const withDeleted = includeDeleted === 'true';
    return this.farmsService.findByOwner(ownerId, withDeleted);
  }

  @Get('owner/:ownerId/default')
  @ApiOperation({ summary: 'Get default farm for owner' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID' })
  @ApiResponse({ status: 200, description: 'Default farm for the owner', type: FarmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No default farm found' })
  findDefault(@Param('ownerId') ownerId: string): Promise<FarmResponseDto> {
    return this.farmsService.findDefault(ownerId);
  }

  @Get('location')
  @ApiOperation({ summary: 'Search farms by geographic location' })
  @ApiQuery({ name: 'country', required: false, description: 'Country code (ISO 3166-1 alpha-2)', example: 'FR' })
  @ApiQuery({ name: 'department', required: false, description: 'Department code', example: '81' })
  @ApiResponse({ status: 200, description: 'List of farms matching location criteria', type: [FarmResponseDto] })
  @ApiResponse({ status: 400, description: 'Invalid country or department format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByLocation(
    @Query('country') country?: string,
    @Query('department') department?: string,
  ): Promise<FarmResponseDto[]> {
    return this.farmsService.findByLocation(country, department);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a farm by ID',
    description: 'Use ?includeStats=true to include entity counts (slower with large datasets)',
  })
  @ApiParam({ name: 'id', description: 'Farm UUID' })
  @ApiQuery({ name: 'includeStats', required: false, description: 'Include statistics counts', type: Boolean })
  @ApiResponse({ status: 200, description: 'Farm details', type: FarmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found or deleted' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeStats') includeStats?: string,
  ): Promise<FarmResponseDto> {
    const withStats = includeStats === 'true';
    return this.farmsService.findOne(id, withStats);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a farm' })
  @ApiParam({ name: 'id', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Farm updated successfully', type: FarmResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or geo codes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch (optimistic locking)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFarmDto: UpdateFarmDto,
  ): Promise<FarmResponseDto> {
    return this.farmsService.update(id, updateFarmDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle farm active status' })
  @ApiParam({ name: 'id', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Farm active status toggled successfully', type: FarmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Cannot deactivate default farm' })
  toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleActiveFarmDto,
  ): Promise<FarmResponseDto> {
    return this.farmsService.toggleActive(id, dto.isActive);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a farm', description: 'Soft deletes the farm (sets deletedAt timestamp)' })
  @ApiParam({ name: 'id', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Farm soft deleted successfully', type: FarmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Cannot delete default farm or farm with active animals' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<FarmResponseDto> {
    return this.farmsService.remove(id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted farm' })
  @ApiParam({ name: 'id', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Farm restored successfully', type: FarmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Farm is not deleted' })
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<FarmResponseDto> {
    return this.farmsService.restore(id);
  }
}
