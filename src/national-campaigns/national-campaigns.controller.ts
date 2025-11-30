import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NationalCampaignsService, FindAllOptions, PaginatedResponse } from './national-campaigns.service';
import { CreateNationalCampaignDto, UpdateNationalCampaignDto, NationalCampaignResponseDto, CampaignType } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for managing National Campaigns
 * PHASE_07: NationalCampaigns - Migrated to /api/v1 with pagination, search, and Guards
 */
@ApiTags('National Campaigns')
@Controller('api/v1/national-campaigns')
export class NationalCampaignsController {
  constructor(private readonly nationalCampaignsService: NationalCampaignsService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new national campaign (Admin only)' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully', type: NationalCampaignResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or dates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 409, description: 'Conflict - Code already exists' })
  create(@Body() createDto: CreateNationalCampaignDto): Promise<NationalCampaignResponseDto> {
    return this.nationalCampaignsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all national campaigns with pagination, filters, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20, max: 100)', example: 20 })
  @ApiQuery({ name: 'type', required: false, enum: CampaignType, description: 'Filter by campaign type' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'search', required: false, description: 'Search in code, names', example: 'vaccination' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Field to sort by (nameFr, nameEn, code, startDate, endDate, type, createdAt)', example: 'startDate' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (ASC or DESC)', example: 'DESC' })
  @ApiResponse({ status: 200, description: 'National campaigns list with pagination metadata' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('type', new ParseEnumPipe(CampaignType, { optional: true })) type?: CampaignType,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.nationalCampaignsService.findAll({ page, limit, type, isActive, search, orderBy, order });
  }

  @Get('current')
  @ApiOperation({
    summary: 'Get current national campaigns',
    description: 'Returns campaigns where today is between startDate and endDate',
  })
  @ApiResponse({ status: 200, description: 'List of currently active campaigns', type: [NationalCampaignResponseDto] })
  findCurrent(): Promise<NationalCampaignResponseDto[]> {
    return this.nationalCampaignsService.findCurrent();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a national campaign by code' })
  @ApiParam({ name: 'code', description: 'Campaign code', example: 'brucellose_2025' })
  @ApiResponse({ status: 200, description: 'Campaign found', type: NationalCampaignResponseDto })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  findByCode(@Param('code') code: string): Promise<NationalCampaignResponseDto> {
    return this.nationalCampaignsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a national campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign found', type: NationalCampaignResponseDto })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  findOne(@Param('id') id: string): Promise<NationalCampaignResponseDto> {
    return this.nationalCampaignsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a national campaign (Admin only)' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully', type: NationalCampaignResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or dates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch' })
  update(@Param('id') id: string, @Body() updateDto: UpdateNationalCampaignDto): Promise<NationalCampaignResponseDto> {
    return this.nationalCampaignsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a national campaign (Admin only)' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign soft deleted successfully', type: NationalCampaignResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  remove(@Param('id') id: string): Promise<NationalCampaignResponseDto> {
    return this.nationalCampaignsService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a soft-deleted national campaign (Admin only)' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign restored successfully', type: NationalCampaignResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Campaign is not deleted' })
  restore(@Param('id') id: string): Promise<NationalCampaignResponseDto> {
    return this.nationalCampaignsService.restore(id);
  }
}
