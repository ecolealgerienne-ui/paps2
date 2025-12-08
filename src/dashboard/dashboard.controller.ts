import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { ActionsQueryDto, DashboardStatsQueryDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('actions')
  @ApiOperation({ summary: 'Get unified action center with all required tasks' })
  @ApiResponse({ status: 200, description: 'Action center with prioritized tasks' })
  getActions(@Param('farmId') farmId: string, @Query() query: ActionsQueryDto) {
    return this.dashboardService.getActions(farmId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get comprehensive dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  getStats(@Param('farmId') farmId: string, @Query() query: DashboardStatsQueryDto) {
    return this.dashboardService.getStats(farmId, query);
  }
}
