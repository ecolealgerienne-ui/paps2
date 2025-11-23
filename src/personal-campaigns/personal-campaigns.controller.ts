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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PersonalCampaignsService } from './personal-campaigns.service';
import { CreatePersonalCampaignDto, UpdatePersonalCampaignDto, QueryPersonalCampaignDto } from './dto';
import { CampaignType } from './types/campaign-type.enum';
import { PersonalCampaignStatus } from './types/personal-campaign-status.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('personal-campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('farms/:farmId/personal-campaigns')
export class PersonalCampaignsController {
  constructor(private readonly personalCampaignsService: PersonalCampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a personal campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreatePersonalCampaignDto) {
    return this.personalCampaignsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all personal campaigns' })
  @ApiQuery({ name: 'type', required: false, enum: CampaignType })
  @ApiQuery({ name: 'status', required: false, enum: PersonalCampaignStatus })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of personal campaigns' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryPersonalCampaignDto) {
    return this.personalCampaignsService.findAll(farmId, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active personal campaigns' })
  @ApiResponse({ status: 200, description: 'List of active campaigns' })
  getActive(@Param('farmId') farmId: string) {
    return this.personalCampaignsService.getActiveCampaigns(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a personal campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.personalCampaignsService.findOne(farmId, id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get personal campaign progress' })
  @ApiResponse({ status: 200, description: 'Campaign progress stats' })
  getProgress(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.personalCampaignsService.getCampaignProgress(farmId, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark personal campaign as completed' })
  @ApiResponse({ status: 200, description: 'Campaign completed' })
  complete(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.personalCampaignsService.complete(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a personal campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePersonalCampaignDto,
  ) {
    return this.personalCampaignsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a personal campaign (soft delete)' })
  @ApiResponse({ status: 200, description: 'Campaign deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.personalCampaignsService.remove(farmId, id);
  }
}
