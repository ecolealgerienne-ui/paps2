import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FarmPreferencesService } from './farm-preferences.service';
import { UpdateFarmPreferencesDto, FarmPreferencesResponseDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('Farm Preferences')
@Controller('api/v1/farms/:farmId/preferences')
@UseGuards(AuthGuard, FarmGuard)
@ApiBearerAuth()
export class FarmPreferencesController {
  constructor(private readonly farmPreferencesService: FarmPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get farm preferences' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Farm preferences', type: FarmPreferencesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner of this farm' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findOne(
    @Param('farmId', ParseUUIDPipe) farmId: string,
  ): Promise<FarmPreferencesResponseDto> {
    return this.farmPreferencesService.findOne(farmId);
  }

  @Put()
  @ApiOperation({ summary: 'Update farm preferences (creates if not exists)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully', type: FarmPreferencesResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner of this farm' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  update(
    @Param('farmId', ParseUUIDPipe) farmId: string,
    @Body() dto: UpdateFarmPreferencesDto,
  ): Promise<FarmPreferencesResponseDto> {
    return this.farmPreferencesService.update(farmId, dto);
  }
}
