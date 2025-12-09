import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportDataQueryDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('data')
  @ApiOperation({ summary: 'Get report data for export (bulk, no pagination)' })
  @ApiResponse({ status: 200, description: 'Report data for export' })
  getReportData(
    @Param('farmId') farmId: string,
    @Query() query: ReportDataQueryDto,
  ) {
    return this.reportsService.getReportData(farmId, query);
  }
}
