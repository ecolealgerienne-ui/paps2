import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FarmPreferencesService } from './farm-preferences.service';
import { UpdateFarmPreferencesDto } from './dto';

@ApiTags('Farm Preferences')
@Controller('farms/:farmId/preferences')
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
