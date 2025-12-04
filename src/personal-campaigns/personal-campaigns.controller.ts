import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PersonalCampaignsService } from './personal-campaigns.service';
import {
  CreatePersonalCampaignDto,
  UpdatePersonalCampaignDto,
  QueryPersonalCampaignDto,
  PersonalCampaignResponseDto,
} from './dto';
import { CampaignType } from './types/campaign-type.enum';
import { PersonalCampaignStatus } from './types/personal-campaign-status.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('Personal Campaigns')
@Controller('api/v1/farms/:farmId/personal-campaigns')
@UseGuards(AuthGuard, FarmGuard)
@ApiBearerAuth()
export class PersonalCampaignsController {
  constructor(private readonly personalCampaignsService: PersonalCampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a personal campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Campaign created', type: PersonalCampaignResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  create(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: CreatePersonalCampaignDto,
  ): Promise<PersonalCampaignResponseDto> {
    return this.personalCampaignsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all personal campaigns' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'type', required: false, enum: CampaignType })
  @ApiQuery({ name: 'status', required: false, enum: PersonalCampaignStatus })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of personal campaigns', type: [PersonalCampaignResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query() query: QueryPersonalCampaignDto,
  ): Promise<PersonalCampaignResponseDto[]> {
    return this.personalCampaignsService.findAll(farmId, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active personal campaigns' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'List of active campaigns', type: [PersonalCampaignResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getActive(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<PersonalCampaignResponseDto[]> {
    return this.personalCampaignsService.getActiveCampaigns(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a personal campaign by ID' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign details', type: PersonalCampaignResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PersonalCampaignResponseDto> {
    return this.personalCampaignsService.findOne(farmId, id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get personal campaign progress' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign progress stats' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  getProgress(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.personalCampaignsService.getCampaignProgress(farmId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark personal campaign as completed' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign completed', type: PersonalCampaignResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  complete(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PersonalCampaignResponseDto> {
    return this.personalCampaignsService.complete(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a personal campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign updated', type: PersonalCampaignResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePersonalCampaignDto,
  ): Promise<PersonalCampaignResponseDto> {
    return this.personalCampaignsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a personal campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign soft deleted', type: PersonalCampaignResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  remove(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PersonalCampaignResponseDto> {
    return this.personalCampaignsService.remove(farmId, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted personal campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign restored', type: PersonalCampaignResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiResponse({ status: 409, description: 'Campaign is not deleted' })
  restore(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PersonalCampaignResponseDto> {
    return this.personalCampaignsService.restore(farmId, id);
  }
}
