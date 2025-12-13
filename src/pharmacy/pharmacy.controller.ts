import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { PharmacyStatsQueryDto, PharmacyAlertsQueryDto } from './dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';

@ApiTags('pharmacy')
@ApiBearerAuth()
@UseGuards(AuthGuard, FarmGuard)
@Controller('api/v1/farms/:farmId/pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get pharmacy statistics',
    description: 'Returns aggregated pharmacy metrics: products count, lots status, treatments activity',
  })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacy statistics',
    schema: {
      example: {
        success: true,
        data: {
          summary: {
            totalProducts: 15,
            activeLots: 12,
            expiringLots: 3,
            expiredLots: 1,
          },
          activity: {
            treatmentsInPeriod: 45,
            vaccinationsInPeriod: 20,
            totalInPeriod: 65,
          },
          topProducts: [
            { productId: 'uuid', productName: 'Ivermectine', count: 15 },
          ],
          period: '30d',
          periodStart: '2024-11-13',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  getStats(
    @Param('farmId') farmId: string,
    @Query() query: PharmacyStatsQueryDto,
  ) {
    return this.pharmacyService.getStats(farmId, query);
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Get pharmacy alerts',
    description: 'Returns lots expiring soon and already expired lots',
  })
  @ApiParam({ name: 'farmId', description: 'Farm ID' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacy alerts',
    schema: {
      example: {
        success: true,
        data: {
          expiringSoon: [
            {
              id: 'lot-uuid',
              nickname: 'Lot Janvier',
              officialLotNumber: 'C4567-9A',
              expiryDate: '2024-12-25',
              daysUntilExpiry: 12,
              product: { id: 'product-uuid', name: 'Ivermectine 1%' },
              configId: 'config-uuid',
            },
          ],
          expired: [],
          summary: {
            expiringSoonCount: 1,
            expiredCount: 0,
            totalAlerts: 1,
          },
          daysThreshold: 30,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Farm not found' })
  getAlerts(
    @Param('farmId') farmId: string,
    @Query() query: PharmacyAlertsQueryDto,
  ) {
    return this.pharmacyService.getAlerts(farmId, query);
  }
}
