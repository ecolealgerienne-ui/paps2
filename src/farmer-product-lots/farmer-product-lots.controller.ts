import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FarmerProductLotsService } from './farmer-product-lots.service';
import {
  CreateFarmerProductLotDto,
  UpdateFarmerProductLotDto,
  QueryFarmerProductLotDto,
} from './dto';

@ApiTags('farmer-product-lots')
@Controller('api/v1/farms/:farmId/product-configs/:configId/lots')
export class FarmerProductLotsController {
  constructor(private readonly service: FarmerProductLotsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un lot de médicament pour une config produit' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'configId', description: 'FarmProductPreference UUID' })
  @ApiResponse({ status: 201, description: 'Lot created' })
  @ApiResponse({ status: 400, description: 'Expiry date must be in the future' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  @ApiResponse({ status: 409, description: 'Lot with same official number already exists' })
  create(
    @Param('farmId') farmId: string,
    @Param('configId') configId: string,
    @Body() dto: CreateFarmerProductLotDto,
  ) {
    return this.service.create(farmId, configId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste paginée des lots d\'une config produit' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'configId', description: 'FarmProductPreference UUID' })
  @ApiResponse({ status: 200, description: 'Paginated list of lots' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  findAll(
    @Param('farmId') farmId: string,
    @Param('configId') configId: string,
    @Query() query: QueryFarmerProductLotDto,
  ) {
    return this.service.findAll(farmId, configId, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer les lots actifs et non périmés' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'configId', description: 'FarmProductPreference UUID' })
  @ApiResponse({ status: 200, description: 'List of active non-expired lots' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  findActive(
    @Param('farmId') farmId: string,
    @Param('configId') configId: string,
  ) {
    return this.service.findActive(farmId, configId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un lot par ID' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'configId', description: 'FarmProductPreference UUID' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot details with recent treatments' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  findOne(
    @Param('farmId') farmId: string,
    @Param('configId') configId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(farmId, configId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un lot' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'configId', description: 'FarmProductPreference UUID' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot updated' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  @ApiResponse({ status: 409, description: 'Lot with same official number already exists' })
  update(
    @Param('farmId') farmId: string,
    @Param('configId') configId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFarmerProductLotDto,
  ) {
    return this.service.update(farmId, configId, id, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activer un lot' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'configId', description: 'FarmProductPreference UUID' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot activated' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  activate(
    @Param('farmId') farmId: string,
    @Param('configId') configId: string,
    @Param('id') id: string,
  ) {
    return this.service.activate(farmId, configId, id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Désactiver un lot' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'configId', description: 'FarmProductPreference UUID' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot deactivated' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  deactivate(
    @Param('farmId') farmId: string,
    @Param('configId') configId: string,
    @Param('id') id: string,
  ) {
    return this.service.deactivate(farmId, configId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un lot (soft delete)' })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'configId', description: 'FarmProductPreference UUID' })
  @ApiParam({ name: 'id', description: 'Lot UUID' })
  @ApiResponse({ status: 200, description: 'Lot deleted' })
  @ApiResponse({ status: 404, description: 'Lot not found' })
  remove(
    @Param('farmId') farmId: string,
    @Param('configId') configId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(farmId, configId, id);
  }
}
