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
import { WeightsService } from './weights.service';
import { CreateWeightDto, UpdateWeightDto, QueryWeightDto, StatsQueryDto, RankingsQueryDto, TrendsQueryDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('weights')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/weights')
export class WeightsController {
  constructor(private readonly weightsService: WeightsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a weight record' })
  @ApiResponse({ status: 201, description: 'Weight created' })
  create(@Param('farmId') farmId: string, @Body() dto: CreateWeightDto) {
    return this.weightsService.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all weight records' })
  @ApiResponse({ status: 200, description: 'List of weights' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryWeightDto) {
    return this.weightsService.findAll(farmId, query);
  }

  @Get('animal/:animalId/history')
  @ApiOperation({ summary: 'Get weight history for an animal with gain calculation' })
  @ApiResponse({ status: 200, description: 'Weight history with daily gain' })
  getAnimalHistory(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
  ) {
    return this.weightsService.getAnimalWeightHistory(farmId, animalId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get weight statistics for the farm' })
  @ApiResponse({ status: 200, description: 'Weight statistics' })
  getStats(@Param('farmId') farmId: string, @Query() query: StatsQueryDto) {
    return this.weightsService.getStats(farmId, query);
  }

  @Get('rankings')
  @ApiOperation({ summary: 'Get animal rankings by daily gain (ADG)' })
  @ApiResponse({ status: 200, description: 'Top and bottom performers by ADG' })
  getRankings(@Param('farmId') farmId: string, @Query() query: RankingsQueryDto) {
    return this.weightsService.getRankings(farmId, query);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get historical ADG trends for charting' })
  @ApiResponse({ status: 200, description: 'Weight trends over time' })
  getTrends(@Param('farmId') farmId: string, @Query() query: TrendsQueryDto) {
    return this.weightsService.getTrends(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a weight by ID' })
  @ApiResponse({ status: 200, description: 'Weight details' })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.weightsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a weight' })
  @ApiResponse({ status: 200, description: 'Weight updated' })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWeightDto,
  ) {
    return this.weightsService.update(farmId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a weight (soft delete)' })
  @ApiResponse({ status: 200, description: 'Weight deleted' })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.weightsService.remove(farmId, id);
  }
}
