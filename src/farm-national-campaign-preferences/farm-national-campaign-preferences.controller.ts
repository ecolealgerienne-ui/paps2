import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FarmNationalCampaignPreferencesService } from './farm-national-campaign-preferences.service';
import {
  UpdateFarmNationalCampaignPreferenceDto,
  FarmNationalCampaignPreferenceResponseDto,
} from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Farm National Campaign Preferences')
@Controller('api/v1/farms/:farmId/campaign-preferences')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class FarmNationalCampaignPreferencesController {
  constructor(private readonly service: FarmNationalCampaignPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all campaign preferences for a farm' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'enrolledOnly', required: false, description: 'Only return enrolled campaigns', example: false })
  @ApiResponse({ status: 200, description: 'List of campaign preferences', type: [FarmNationalCampaignPreferenceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findByFarm(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Query('enrolledOnly') enrolledOnly?: boolean,
  ): Promise<FarmNationalCampaignPreferenceResponseDto[]> {
    return this.service.findByFarm(farmId, enrolledOnly !== true);
  }

  @Get('enrolled')
  @ApiOperation({ summary: 'Get enrolled campaigns for a farm (convenience endpoint)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'List of enrolled campaign preferences', type: [FarmNationalCampaignPreferenceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findEnrolledCampaigns(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<FarmNationalCampaignPreferenceResponseDto[]> {
    return this.service.findEnrolledCampaigns(farmId);
  }

  @Get(':campaignId')
  @ApiOperation({ summary: 'Get campaign preference by campaign ID' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Campaign preference details', type: FarmNationalCampaignPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOneByCampaign(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ): Promise<FarmNationalCampaignPreferenceResponseDto> {
    return this.service.findOneByCampaign(farmId, campaignId);
  }

  @Post(':campaignId/enroll')
  @ApiOperation({ summary: 'Enroll a farm to a national campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 201, description: 'Farm enrolled successfully (UPSERT)', type: FarmNationalCampaignPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Farm or campaign not found' })
  enroll(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ): Promise<FarmNationalCampaignPreferenceResponseDto> {
    return this.service.enroll(farmId, campaignId);
  }

  @Post(':campaignId/unenroll')
  @ApiOperation({ summary: 'Unenroll a farm from a national campaign' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Farm unenrolled successfully', type: FarmNationalCampaignPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No enrollment found' })
  unenroll(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ): Promise<FarmNationalCampaignPreferenceResponseDto> {
    return this.service.unenroll(farmId, campaignId);
  }

  @Put(':campaignId')
  @ApiOperation({ summary: 'Update campaign preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully', type: FarmNationalCampaignPreferenceResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  updateByCampaign(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Body() dto: UpdateFarmNationalCampaignPreferenceDto,
  ): Promise<FarmNationalCampaignPreferenceResponseDto> {
    return this.service.updateByCampaign(farmId, campaignId, dto);
  }

  @Delete(':campaignId')
  @ApiOperation({ summary: 'Soft delete a campaign preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'Preference soft deleted successfully', type: FarmNationalCampaignPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  async remove(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ): Promise<FarmNationalCampaignPreferenceResponseDto> {
    const preference = await this.service.findOneByCampaign(farmId, campaignId);
    return this.service.remove(preference.id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted campaign preference' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Preference restored successfully', type: FarmNationalCampaignPreferenceResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  @ApiResponse({ status: 409, description: 'Preference is not deleted' })
  restore(
    @Param('farmId', ParseUUIDPipe) _farmId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FarmNationalCampaignPreferenceResponseDto> {
    return this.service.restore(id);
  }
}
