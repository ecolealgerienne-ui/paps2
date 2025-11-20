import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FarmPreferencesService } from './farm-preferences.service';
import { UpdateFarmPreferencesDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('Farm Preferences')
@Controller('farms/:farmId/preferences')
@UseGuards(AuthGuard, FarmGuard)
export class FarmPreferencesController {
  constructor(private readonly farmPreferencesService: FarmPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get farm preferences' })
  findOne(@Param('farmId') farmId: string) {
    return this.farmPreferencesService.findOne(farmId);
  }

  @Put()
  @ApiOperation({ summary: 'Update farm preferences' })
  update(
    @Param('farmId') farmId: string,
    @Body() dto: UpdateFarmPreferencesDto,
  ) {
    return this.farmPreferencesService.update(farmId, dto);
  }
}
