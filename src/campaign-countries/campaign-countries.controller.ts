import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CampaignCountriesService, FindAllOptions, PaginatedResponse } from './campaign-countries.service';
import { LinkCampaignCountryDto, CampaignCountryResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

/**
 * Controller for managing NationalCampaign-Country associations
 * PHASE_19: CampaignCountries - Migrated to /api/v1 with pagination, search, and Guards
 */
@ApiTags('Campaign-Countries')
@Controller('api/v1/campaign-countries')
export class CampaignCountriesController {
  constructor(private readonly campaignCountriesService: CampaignCountriesService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a campaign to a country (Admin only)' })
  @ApiResponse({ status: 201, description: 'Campaign successfully linked to country', type: CampaignCountryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Campaign or Country not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Association already exists' })
  link(@Body() dto: LinkCampaignCountryDto): Promise<CampaignCountryResponseDto> {
    return this.campaignCountriesService.link(dto.campaignId, dto.countryCode);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaign-country associations with pagination, filters, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 50, max: 100)', example: 50 })
  @ApiQuery({ name: 'campaignId', required: false, description: 'Filter by campaign ID' })
  @ApiQuery({ name: 'countryCode', required: false, description: 'Filter by country code (ISO 3166-1 alpha-2)', example: 'DZ' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: true })
  @ApiQuery({ name: 'search', required: false, description: 'Search in campaign code, names, country code, names', example: 'vaccination' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Field to sort by (createdAt, updatedAt, isActive)', example: 'createdAt' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order (ASC or DESC)', example: 'ASC' })
  @ApiResponse({ status: 200, description: 'Campaign-country associations list with pagination metadata' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('campaignId') campaignId?: string,
    @Query('countryCode') countryCode?: string,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ): Promise<PaginatedResponse> {
    return this.campaignCountriesService.findAll({ page, limit, campaignId, countryCode, isActive, search, orderBy, order });
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Get all countries for a specific campaign' })
  @ApiParam({ name: 'campaignId', description: 'Campaign UUID' })
  @ApiResponse({ status: 200, description: 'List of countries associated with the campaign', type: [CampaignCountryResponseDto] })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  findCountriesByCampaign(@Param('campaignId') campaignId: string): Promise<CampaignCountryResponseDto[]> {
    return this.campaignCountriesService.findCountriesByCampaign(campaignId);
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get all campaigns for a specific country' })
  @ApiParam({ name: 'countryCode', description: 'Country code (ISO 3166-1 alpha-2)', example: 'DZ' })
  @ApiResponse({ status: 200, description: 'List of campaigns associated with the country', type: [CampaignCountryResponseDto] })
  @ApiResponse({ status: 404, description: 'Country not found' })
  findCampaignsByCountry(@Param('countryCode') countryCode: string): Promise<CampaignCountryResponseDto[]> {
    return this.campaignCountriesService.findCampaignsByCountry(countryCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign-country association by ID' })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association found', type: CampaignCountryResponseDto })
  @ApiResponse({ status: 404, description: 'Association not found' })
  findOne(@Param('id') id: string): Promise<CampaignCountryResponseDto> {
    return this.campaignCountriesService.findOne(id);
  }

  @Delete()
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink a campaign from a country (Admin only)' })
  @ApiResponse({ status: 200, description: 'Campaign successfully unlinked from country', type: CampaignCountryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  unlink(@Body() dto: LinkCampaignCountryDto): Promise<CampaignCountryResponseDto> {
    return this.campaignCountriesService.unlink(dto.campaignId, dto.countryCode);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a deactivated campaign-country association (Admin only)' })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association restored successfully', type: CampaignCountryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Association is not deactivated' })
  restore(@Param('id') id: string): Promise<CampaignCountryResponseDto> {
    return this.campaignCountriesService.restore(id);
  }
}
