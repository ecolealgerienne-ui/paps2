import { Controller, Get, Post, Patch, Delete, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { FarmProductPreferencesService } from './farm-product-preferences.service';
import {
  CreateFarmProductPreferenceDto,
  UpdateFarmProductPreferenceDto,
  UpdateProductConfigDto,
} from './dto';

@ApiTags('farm-product-preferences')
@Controller('farms/:farmId/product-preferences')
export class FarmProductPreferencesController {
  constructor(private readonly service: FarmProductPreferencesService) {}

  @Post()
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

  @Put(':id')
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

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une préférence produit' })
  @ApiResponse({ status: 200, description: 'Preference deleted' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ============================================================
  // CONFIGURATION PERSONNALISÉE (surcharge AMM/RCP)
  // ============================================================

  @Get(':id/config')
  @ApiOperation({ summary: 'Récupérer la configuration personnalisée d\'une préférence' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Config with packaging, lots and userDefined fields' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  getConfig(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
  ) {
    return this.service.getConfig(farmId, id);
  }

  @Put(':id/config')
  @ApiOperation({ summary: 'Mettre à jour la configuration personnalisée (surcharge AMM/RCP)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Config updated' })
  @ApiResponse({ status: 400, description: 'Validation error (dose without unit)' })
  @ApiResponse({ status: 404, description: 'Preference or packaging not found' })
  updateConfig(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductConfigDto,
  ) {
    return this.service.updateConfig(farmId, id, dto);
  }

  @Delete(':id/config')
  @ApiOperation({ summary: 'Réinitialiser la configuration personnalisée (remet à NULL)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'id', description: 'Preference UUID' })
  @ApiResponse({ status: 200, description: 'Config reset to NULL values' })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  resetConfig(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
  ) {
    return this.service.resetConfig(farmId, id);
  }
}
