import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CampaignCountriesService } from './campaign-countries.service';
import { LinkCampaignCountryDto } from './dto';

/**
 * Controller for managing NationalCampaign-Country associations
 * PHASE_19: CampaignCountries
 */
@ApiTags('campaign-countries')
@Controller('api/v1/campaign-countries')
export class CampaignCountriesController {
  constructor(private readonly campaignCountriesService: CampaignCountriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all campaign-country associations (Admin)' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive associations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all campaign-country associations',
  })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    const associations = await this.campaignCountriesService.findAll(include);

    return {
      success: true,
      data: associations.map((a) => ({
        id: a.id,
        campaign_id: a.campaignId,
        country_code: a.countryCode,
        is_active: a.isActive,
        created_at: a.createdAt,
        updated_at: a.updatedAt,
        campaign: a.campaign
          ? {
              id: a.campaign.id,
              code: a.campaign.code,
              name_fr: a.campaign.nameFr,
              name_en: a.campaign.nameEn,
              name_ar: a.campaign.nameAr,
              type: a.campaign.type,
            }
          : null,
        country: a.country
          ? {
              code: a.country.code,
              name_fr: a.country.nameFr,
              name_en: a.country.nameEn,
              name_ar: a.country.nameAr,
              region: a.country.region,
            }
          : null,
      })),
    };
  }

  @Get('campaign/:campaignId')
  @ApiOperation({ summary: 'Get all countries for a specific campaign' })
  @ApiParam({
    name: 'campaignId',
    description: 'Campaign UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of countries associated with the campaign',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findCountriesByCampaign(@Param('campaignId') campaignId: string) {
    const associations = await this.campaignCountriesService.findCountriesByCampaign(
      campaignId,
    );

    return {
      success: true,
      data: associations.map((a) => ({
        id: a.id,
        campaign_id: a.campaignId,
        country_code: a.countryCode,
        is_active: a.isActive,
        created_at: a.createdAt,
        updated_at: a.updatedAt,
        campaign: {
          id: a.campaign.id,
          code: a.campaign.code,
          name_fr: a.campaign.nameFr,
          name_en: a.campaign.nameEn,
          name_ar: a.campaign.nameAr,
          type: a.campaign.type,
        },
        country: {
          code: a.country.code,
          name_fr: a.country.nameFr,
          name_en: a.country.nameEn,
          name_ar: a.country.nameAr,
          region: a.country.region,
        },
      })),
    };
  }

  @Get('country/:countryCode')
  @ApiOperation({ summary: 'Get all campaigns for a specific country' })
  @ApiParam({
    name: 'countryCode',
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'DZ',
  })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns associated with the country',
  })
  @ApiResponse({ status: 404, description: 'Country not found' })
  async findCampaignsByCountry(@Param('countryCode') countryCode: string) {
    const associations = await this.campaignCountriesService.findCampaignsByCountry(
      countryCode,
    );

    return {
      success: true,
      data: associations.map((a) => ({
        id: a.id,
        campaign_id: a.campaignId,
        country_code: a.countryCode,
        is_active: a.isActive,
        created_at: a.createdAt,
        updated_at: a.updatedAt,
        campaign: {
          id: a.campaign.id,
          code: a.campaign.code,
          name_fr: a.campaign.nameFr,
          name_en: a.campaign.nameEn,
          name_ar: a.campaign.nameAr,
          type: a.campaign.type,
        },
        country: {
          code: a.country.code,
          name_fr: a.country.nameFr,
          name_en: a.country.nameEn,
          name_ar: a.country.nameAr,
          region: a.country.region,
        },
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Link a campaign to a country' })
  @ApiResponse({
    status: 201,
    description: 'Campaign successfully linked to country',
  })
  @ApiResponse({ status: 404, description: 'Campaign or Country not found' })
  @ApiResponse({ status: 409, description: 'Association already exists' })
  async link(@Body() dto: LinkCampaignCountryDto) {
    const association = await this.campaignCountriesService.link(
      dto.campaignId,
      dto.countryCode,
    );

    return {
      success: true,
      message: 'Campaign successfully linked to country',
      data: {
        id: association.id,
        campaign_id: association.campaignId,
        country_code: association.countryCode,
        is_active: association.isActive,
        created_at: association.createdAt,
        updated_at: association.updatedAt,
        campaign: {
          id: association.campaign.id,
          code: association.campaign.code,
          name_fr: association.campaign.nameFr,
          name_en: association.campaign.nameEn,
          name_ar: association.campaign.nameAr,
          type: association.campaign.type,
        },
        country: {
          code: association.country.code,
          name_fr: association.country.nameFr,
          name_en: association.country.nameEn,
          name_ar: association.country.nameAr,
          region: association.country.region,
        },
      },
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink a campaign from a country' })
  @ApiResponse({
    status: 200,
    description: 'Campaign successfully unlinked from country',
  })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async unlink(@Body() dto: LinkCampaignCountryDto) {
    const association = await this.campaignCountriesService.unlink(
      dto.campaignId,
      dto.countryCode,
    );

    return {
      success: true,
      message: 'Campaign successfully unlinked from country',
      data: {
        id: association.id,
        campaign_id: association.campaignId,
        country_code: association.countryCode,
        is_active: association.isActive,
      },
    };
  }
}
