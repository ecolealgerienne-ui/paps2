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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({ status: 200, description: 'List of campaigns' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryCampaignDto) {
    return this.campaignsService.findAll(farmId, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active campaigns' })
  @ApiResponse({ status: 200, description: 'List of active campaigns' })
  getActive(@Param('farmId') farmId: string) {
    return this.campaignsService.getActiveCampaigns(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details with vaccinations' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.campaignsService.findOne(farmId, id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get campaign progress' })
  @ApiResponse({ status: 200, description: 'Campaign progress stats' })
  getProgress(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.campaignsService.getCampaignProgress(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign (soft delete)' })
  @ApiResponse({ status: 200, description: 'Campaign deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.campaignsService.remove(farmId, id);
  }
}
