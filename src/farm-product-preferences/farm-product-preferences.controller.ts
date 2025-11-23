import { Controller, Get, Post, Patch, Delete, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { FarmProductPreferencesService } from './farm-product-preferences.service';
import { CreateFarmProductPreferenceDto, UpdateFarmProductPreferenceDto } from './dto';

@ApiTags('farm-product-preferences')
@Controller('farm-product-preferences')
export class FarmProductPreferencesController {
  constructor(private readonly service: FarmProductPreferencesService) {}

  @Post('farm/:farmId')
  @ApiOperation({ summary: 'Créer une préférence produit pour une ferme' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 201, description: 'Preference created' })
  @ApiResponse({ status: 400, description: 'XOR constraint violation (must specify exactly one product)' })
  @ApiResponse({ status: 404, description: 'Farm or product not found' })
  create(
    @Param('farmId') farmId: string,
    @Body() dto: CreateFarmProductPreferenceDto
  ) {
    return this.service.create(farmId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste toutes les préférences produits' })
  @ApiResponse({ status: 200, description: 'List of all preferences' })
  findAll() {
    return this.service.findAll();
  }

  @Get('farm/:farmId')
  @ApiOperation({ summary: 'Liste des préférences produits d\'une ferme (PHASE_21)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiResponse({ status: 200, description: 'Farm product preferences ordered by displayOrder' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  findByFarm(@Param('farmId') farmId: string) {
    return this.service.findByFarm(farmId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détails d\'une préférence produit' })
  @ApiResponse({ status: 200, description: 'Preference details' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une préférence produit' })
  @ApiResponse({ status: 200, description: 'Preference updated' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  update(@Param('id') id: string, @Body() dto: UpdateFarmProductPreferenceDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activer/désactiver une préférence' })
  @ApiResponse({ status: 200, description: 'Preference status toggled' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  toggleActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.service.toggleActive(id, isActive);
  }

  @Put('farm/:farmId/reorder')
  @ApiOperation({ summary: 'Réorganiser l\'ordre des préférences d\'une ferme' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderedIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Ordered array of preference IDs',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Preferences reordered' })
  @ApiResponse({ status: 400, description: 'Invalid preference IDs' })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  reorder(@Param('farmId') farmId: string, @Body('orderedIds') orderedIds: string[]) {
    return this.service.reorder(farmId, orderedIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une préférence produit' })
  @ApiResponse({ status: 200, description: 'Preference deleted' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
