import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NationalCampaignsService } from './national-campaigns.service';
import { CreateNationalCampaignDto, UpdateNationalCampaignDto, QueryNationalCampaignDto, CampaignType } from './dto';

@ApiTags('National Campaigns')
@Controller('api/national-campaigns')
export class NationalCampaignsController {
  constructor(private readonly nationalCampaignsService: NationalCampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new national campaign (PHASE_07)' })
  @ApiResponse({ status: 201, description: 'National campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or dates' })
  @ApiResponse({ status: 409, description: 'Conflict - Code already exists' })
  create(@Body() createDto: CreateNationalCampaignDto) {
    return this.nationalCampaignsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all national campaigns with filters (PHASE_07)' })
  @ApiResponse({ status: 200, description: 'List of national campaigns' })
  @ApiQuery({ name: 'type', required: false, enum: CampaignType, description: 'Filter by campaign type' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or code' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Include deleted campaigns' })
  findAll(@Query() query: QueryNationalCampaignDto) {
    return this.nationalCampaignsService.findAll(query);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current national campaigns (PHASE_07)', description: 'Returns campaigns where today is between startDate and endDate' })
  @ApiResponse({ status: 200, description: 'List of currently active campaigns' })
  findCurrent() {
    return this.nationalCampaignsService.findCurrent();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a national campaign by code (PHASE_07)' })
  @ApiParam({ name: 'code', description: 'Campaign code', example: 'brucellose_2025' })
  @ApiResponse({ status: 200, description: 'National campaign details' })
  @ApiResponse({ status: 404, description: 'National campaign not found' })
  findByCode(@Param('code') code: string) {
    return this.nationalCampaignsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a national campaign by ID (PHASE_07)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'National campaign details' })
  @ApiResponse({ status: 404, description: 'National campaign not found or deleted' })
  findOne(@Param('id') id: string) {
    return this.nationalCampaignsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a national campaign (PHASE_07)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'National campaign updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or dates' })
  @ApiResponse({ status: 404, description: 'National campaign not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Version mismatch or code already exists' })
  update(@Param('id') id: string, @Body() updateDto: UpdateNationalCampaignDto) {
    return this.nationalCampaignsService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a national campaign (PHASE_07)', description: 'Soft deletes the campaign (sets deletedAt timestamp)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'National campaign soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'National campaign not found' })
  remove(@Param('id') id: string) {
    return this.nationalCampaignsService.remove(id);
  }
}
