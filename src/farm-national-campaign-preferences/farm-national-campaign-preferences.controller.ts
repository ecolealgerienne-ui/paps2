import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FarmNationalCampaignPreferencesService } from './farm-national-campaign-preferences.service';
import { CreateFarmNationalCampaignPreferenceDto, UpdateFarmNationalCampaignPreferenceDto } from './dto';

@ApiTags('farm-national-campaign-preferences')
@Controller('farms/:farmId/campaign-preferences')
export class FarmNationalCampaignPreferencesController {
  constructor(private readonly service: FarmNationalCampaignPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all campaign preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'List of preferences for the farm' })
  findByFarm(@Param('farmId') farmId: string) {
    return this.service.findByFarm(farmId);
  }

  @Get(':campaignId')
  @ApiOperation({ summary: 'Get campaign preference by campaign ID' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Preference details' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOneByCampaign(@Param('farmId') farmId: string, @Param('campaignId') campaignId: string) {
    return this.service.findOneByCampaign(farmId, campaignId);
  }

  @Post(':campaignId/enroll')
  @ApiOperation({ summary: 'Enroll a farm to a national campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 201, description: 'Farm enrolled successfully (UPSERT)' })
  @ApiResponse({ status: 400, description: 'Invalid farm or campaign ID' })
  enroll(@Param('farmId') farmId: string, @Param('campaignId') campaignId: string) {
    return this.service.enroll(farmId, campaignId);
  }

  @Post(':campaignId/unenroll')
  @ApiOperation({ summary: 'Unenroll a farm from a national campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Farm unenrolled successfully' })
  @ApiResponse({ status: 404, description: 'No enrollment found' })
  unenroll(@Param('farmId') farmId: string, @Param('campaignId') campaignId: string) {
    return this.service.unenroll(farmId, campaignId);
  }

  @Put(':campaignId')
  @ApiOperation({ summary: 'Update campaign preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  updateByCampaign(@Param('farmId') farmId: string, @Param('campaignId') campaignId: string, @Body() dto: UpdateFarmNationalCampaignPreferenceDto) {
    return this.service.updateByCampaign(farmId, campaignId, dto);
  }
}
