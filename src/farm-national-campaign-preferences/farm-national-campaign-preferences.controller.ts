import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FarmNationalCampaignPreferencesService } from './farm-national-campaign-preferences.service';
import { CreateFarmNationalCampaignPreferenceDto, UpdateFarmNationalCampaignPreferenceDto } from './dto';

@ApiTags('farm-national-campaign-preferences')
@Controller('farm-national-campaign-preferences')
export class FarmNationalCampaignPreferencesController {
  constructor(private readonly service: FarmNationalCampaignPreferencesService) {}

  @Post()
  @ApiOperation({ summary: 'Create farm campaign preference' })
  @ApiResponse({ status: 201, description: 'Preference created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Preference already exists for this farm-campaign pair' })
  create(@Body() dto: CreateFarmNationalCampaignPreferenceDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all farm campaign preferences' })
  @ApiResponse({ status: 200, description: 'List of all preferences' })
  findAll() {
    return this.service.findAll();
  }

  @Get('farm/:farmId')
  @ApiOperation({ summary: 'Get all campaign preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'List of preferences for the farm' })
  findByFarm(@Param('farmId') farmId: string) {
    return this.service.findByFarm(farmId);
  }

  @Get('farm/:farmId/enrolled')
  @ApiOperation({ summary: 'Get all enrolled campaigns for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'List of enrolled campaigns (isEnrolled=true)' })
  findEnrolledCampaigns(@Param('farmId') farmId: string) {
    return this.service.findEnrolledCampaigns(farmId);
  }

  @Post('farm/:farmId/campaign/:campaignId/enroll')
  @ApiOperation({ summary: 'Enroll a farm to a national campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 201, description: 'Farm enrolled successfully (UPSERT)' })
  @ApiResponse({ status: 400, description: 'Invalid farm or campaign ID' })
  enroll(@Param('farmId') farmId: string, @Param('campaignId') campaignId: string) {
    return this.service.enroll(farmId, campaignId);
  }

  @Delete('farm/:farmId/campaign/:campaignId/unenroll')
  @ApiOperation({ summary: 'Unenroll a farm from a national campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Farm unenrolled successfully' })
  @ApiResponse({ status: 404, description: 'No enrollment found' })
  unenroll(@Param('farmId') farmId: string, @Param('campaignId') campaignId: string) {
    return this.service.unenroll(farmId, campaignId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference details' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign preference' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() dto: UpdateFarmNationalCampaignPreferenceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign preference' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference deleted successfully' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
