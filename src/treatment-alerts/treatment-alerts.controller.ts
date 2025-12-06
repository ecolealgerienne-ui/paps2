import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TreatmentAlertsService } from './treatment-alerts.service';
import {
  ContraindicationCheckDto,
  WithdrawalCheckDto,
  ExpiringLotsResponseDto,
} from './dto';

@ApiTags('treatment-alerts')
@Controller('api/v1/farms/:farmId/alerts')
export class TreatmentAlertsController {
  constructor(private readonly service: TreatmentAlertsService) {}

  @Get('check-contraindication')
  @ApiOperation({
    summary: 'Vérifier contre-indication pour un animal et un produit',
    description: 'Vérifie si un animal a une contre-indication (ex: gestation) pour un produit donné. Alerte non-bloquante.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({ name: 'animalId', description: 'Animal UUID', required: true })
  @ApiQuery({ name: 'productId', description: 'Product UUID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Résultat de la vérification',
    type: ContraindicationCheckDto,
  })
  @ApiResponse({ status: 404, description: 'Animal or product not found' })
  checkContraindication(
    @Param('farmId') farmId: string,
    @Query('animalId') animalId: string,
    @Query('productId') productId: string,
  ): Promise<ContraindicationCheckDto> {
    return this.service.checkContraindication(farmId, animalId, productId);
  }

  @Get('check-withdrawal/:animalId')
  @ApiOperation({
    summary: 'Vérifier les délais d\'attente actifs pour un animal',
    description: 'Retourne tous les délais d\'attente (viande et lait) encore actifs pour un animal.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiParam({ name: 'animalId', description: 'Animal UUID' })
  @ApiResponse({
    status: 200,
    description: 'Liste des délais d\'attente actifs',
    type: WithdrawalCheckDto,
  })
  @ApiResponse({ status: 404, description: 'Animal not found' })
  checkWithdrawal(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
  ): Promise<WithdrawalCheckDto> {
    return this.service.checkWithdrawal(farmId, animalId);
  }

  @Get('expiring-lots')
  @ApiOperation({
    summary: 'Récupérer les lots proches de la péremption',
    description: 'Retourne les lots de médicaments proches de la péremption et les lots déjà périmés.',
  })
  @ApiParam({ name: 'farmId', description: 'Farm UUID' })
  @ApiQuery({
    name: 'daysThreshold',
    description: 'Nombre de jours avant péremption pour alerter (default: 30)',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lots en alerte (proches péremption + périmés)',
    type: ExpiringLotsResponseDto,
  })
  getExpiringLots(
    @Param('farmId') farmId: string,
    @Query('daysThreshold') daysThreshold?: string,
  ): Promise<ExpiringLotsResponseDto> {
    const threshold = daysThreshold ? parseInt(daysThreshold, 10) : 30;
    return this.service.getExpiringLots(farmId, threshold);
  }
}
