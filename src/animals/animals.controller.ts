import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FarmGuard } from '../auth/guards/farm.guard';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto, QueryAnimalDto, QueryAnimalStatsDto, UpdateAnimalDto } from './dto';
import { TreatmentsService } from '../treatments/treatments.service';
import { QueryTreatmentDto } from '../treatments/dto';

@ApiTags('Animals')
@ApiBearerAuth()
@Controller('api/v1/farms/:farmId/animals')
@UseGuards(AuthGuard, FarmGuard)
export class AnimalsController {
  constructor(
    private readonly animalsService: AnimalsService,
    private readonly treatmentsService: TreatmentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un animal' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  create(
    @Param('farmId') farmId: string,
    @Body() createAnimalDto: CreateAnimalDto,
  ) {
    return this.animalsService.create(farmId, createAnimalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des animaux' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  findAll(@Param('farmId') farmId: string, @Query() query: QueryAnimalDto) {
    return this.animalsService.findAll(farmId, query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques des animaux (KPIs)',
    description: 'Retourne les KPIs des animaux. Supporte les mêmes filtres que GET /animals pour calculer les stats sur un sous-ensemble.',
  })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des animaux (filtrées si paramètres fournis)',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Nombre total d\'animaux (filtré)' },
        byStatus: {
          type: 'object',
          properties: {
            draft: { type: 'number' },
            alive: { type: 'number' },
            sold: { type: 'number' },
            dead: { type: 'number' },
            slaughtered: { type: 'number' },
            onTemporaryMovement: { type: 'number' },
          },
        },
        bySex: {
          type: 'object',
          properties: {
            male: { type: 'number' },
            female: { type: 'number' },
          },
        },
        notWeighedCount: { type: 'number', description: 'Animaux vivants non pesés depuis X jours (filtré)' },
        notWeighedDays: { type: 'number', description: 'Nombre de jours utilisé pour le calcul' },
      },
    },
  })
  getStats(
    @Param('farmId') farmId: string,
    @Query() query: QueryAnimalStatsDto,
  ) {
    return this.animalsService.getStats(farmId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un animal" })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiParam({ name: 'id', description: "ID de l'animal" })
  findOne(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.animalsService.findOne(farmId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un animal' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiParam({ name: 'id', description: "ID de l'animal" })
  update(
    @Param('farmId') farmId: string,
    @Param('id') id: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ) {
    return this.animalsService.update(farmId, id, updateAnimalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un animal (soft delete)' })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiParam({ name: 'id', description: "ID de l'animal" })
  remove(@Param('farmId') farmId: string, @Param('id') id: string) {
    return this.animalsService.remove(farmId, id);
  }

  @Get(':animalId/treatments')
  @ApiOperation({ summary: "Liste des traitements d'un animal" })
  @ApiParam({ name: 'farmId', description: 'ID de la ferme' })
  @ApiParam({ name: 'animalId', description: "ID de l'animal" })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut (scheduled, in_progress, completed, cancelled)' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Date de début (ISO 8601)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Date de fin (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Liste des traitements de l\'animal' })
  @ApiResponse({ status: 404, description: 'Animal non trouvé' })
  findTreatments(
    @Param('farmId') farmId: string,
    @Param('animalId') animalId: string,
    @Query() query: QueryTreatmentDto,
  ) {
    return this.treatmentsService.findByAnimalId(farmId, animalId, query);
  }
}
