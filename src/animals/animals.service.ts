// Animals service - aligned with Prisma schema
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto, QueryAnimalDto, UpdateAnimalDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { AlertEngineService } from '../farm-alerts/alert-engine/alert-engine.service';

@Injectable()
export class AnimalsService {
  private readonly logger = new AppLogger(AnimalsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AlertEngineService))
    private alertEngineService: AlertEngineService,
  ) {}

  /**
   * Trigger alert regeneration after animal changes (non-blocking)
   */
  private triggerAlertRegeneration(farmId: string): void {
    this.alertEngineService.invalidateAndRegenerate(farmId).catch((err) => {
      this.logger.error(`Alert regeneration failed for farm ${farmId}`, err.stack);
    });
  }

  async create(farmId: string, dto: CreateAnimalDto) {
    this.logger.debug(`Creating animal in farm ${farmId}`, {
      eid: dto.currentEid,
      species: dto.speciesId,
    });

    try {
      const animal = await this.prisma.animal.create({
        data: {
          id: dto.id,
          farmId: dto.farmId || farmId,
          currentLocationFarmId: dto.currentLocationFarmId,
          currentEid: dto.currentEid,
          officialNumber: dto.officialNumber,
          visualId: dto.visualId,
          eidHistory: dto.eidHistory ? JSON.stringify(dto.eidHistory) : null,
          birthDate: new Date(dto.birthDate),
          sex: dto.sex,
          motherId: dto.motherId,
          fatherId: dto.fatherId,
          speciesId: dto.speciesId,
          breedId: dto.breedId,
          status: dto.status || 'alive',
          validatedAt: dto.validatedAt ? new Date(dto.validatedAt) : null,
          photoUrl: dto.photoUrl,
          notes: dto.notes,
          days: dto.days,
          // CRITICAL: Use client timestamps if provided (offline-first)
          ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
        },
        include: {
          species: true,
          breed: true,
          mother: true,
        },
      });

      this.logger.audit('Animal created', {
        animalId: animal.id,
        farmId,
        species: dto.speciesId,
        eid: dto.currentEid,
      });

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

      return animal;
    } catch (error) {
      this.logger.error(
        `Failed to create animal in farm ${farmId}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryAnimalDto) {
    const {
      status,
      speciesId,
      breedId,
      sex,
      search,
      notWeighedDays,
      minWeight,
      maxWeight,
      page,
      limit,
      sort,
      order,
    } = query;

    // Filtres de base
    const where: any = {
      farmId,
      deletedAt: null,
      ...(status && { status }),
      ...(speciesId && { speciesId }),
      ...(breedId && { breedId }),
      ...(sex && { sex }),
      ...(search && {
        OR: [
          { currentEid: { contains: search, mode: 'insensitive' as const } },
          {
            officialNumber: { contains: search, mode: 'insensitive' as const },
          },
          { visualId: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Filtres basés sur les poids (nécessitent des sous-requêtes)
    const hasWeightFilters = notWeighedDays || minWeight !== undefined || maxWeight !== undefined;

    if (hasWeightFilters) {
      // Récupérer les IDs des animaux qui correspondent aux critères de poids
      const animalIdsFromWeightFilters = await this.getAnimalIdsByWeightCriteria(
        farmId,
        notWeighedDays,
        minWeight,
        maxWeight,
      );

      if (animalIdsFromWeightFilters.length === 0) {
        // Aucun animal ne correspond aux critères de poids
        return {
          data: [],
          meta: {
            page: page || 1,
            limit: limit || 50,
            total: 0,
            totalPages: 0,
          },
        };
      }

      where.id = { in: animalIdsFromWeightFilters };
    }

    const [animals, total] = await Promise.all([
      this.prisma.animal.findMany({
        where,
        include: {
          species: true,
          breed: true,
        },
        orderBy: { [sort || 'createdAt']: order || 'desc' },
        skip: ((page || 1) - 1) * (limit || 50),
        take: limit || 50,
      }),
      this.prisma.animal.count({ where }),
    ]);

    // Enrichir avec currentWeight et lastWeighDate
    const animalIds = animals.map((a) => a.id);
    const latestWeights = await this.getLatestWeightsForAnimals(farmId, animalIds);

    const enrichedAnimals = animals.map((animal) => {
      const weightInfo = latestWeights.get(animal.id);
      return {
        ...animal,
        currentWeight: weightInfo?.currentWeight ?? null,
        lastWeighDate: weightInfo?.lastWeighDate ?? null,
        previousWeight: weightInfo?.previousWeight ?? null,
        weightTrend: weightInfo?.weightTrend ?? null,
        weightDelta: weightInfo?.weightDelta ?? null,
      };
    });

    return {
      data: enrichedAnimals,
      meta: {
        page: page || 1,
        limit: limit || 50,
        total,
        totalPages: Math.ceil(total / (limit || 50)),
      },
    };
  }

  /**
   * Récupère les 2 derniers poids pour une liste d'animaux et calcule la tendance
   */
  private async getLatestWeightsForAnimals(
    farmId: string,
    animalIds: string[],
  ): Promise<Map<string, {
    currentWeight: number;
    lastWeighDate: Date;
    previousWeight: number | null;
    weightTrend: 'up' | 'down' | 'stable' | null;
    weightDelta: number | null;
  }>> {
    if (animalIds.length === 0) {
      return new Map();
    }

    // Récupérer tous les poids des animaux, triés par date décroissante
    const weights = await this.prisma.weight.findMany({
      where: {
        farmId,
        animalId: { in: animalIds },
        deletedAt: null,
      },
      orderBy: { weightDate: 'desc' },
      select: {
        animalId: true,
        weight: true,
        weightDate: true,
      },
    });

    // Garder les 2 derniers poids par animal
    const weightsByAnimal = new Map<string, { weight: number; date: Date }[]>();
    weights.forEach((w) => {
      const existing = weightsByAnimal.get(w.animalId) || [];
      if (existing.length < 2) {
        existing.push({ weight: w.weight, date: w.weightDate });
        weightsByAnimal.set(w.animalId, existing);
      }
    });

    // Calculer tendance et delta
    const result = new Map<string, {
      currentWeight: number;
      lastWeighDate: Date;
      previousWeight: number | null;
      weightTrend: 'up' | 'down' | 'stable' | null;
      weightDelta: number | null;
    }>();

    weightsByAnimal.forEach((animalWeights, animalId) => {
      const current = animalWeights[0];
      const previous = animalWeights[1] || null;

      let weightTrend: 'up' | 'down' | 'stable' | null = null;
      let weightDelta: number | null = null;

      if (previous) {
        weightDelta = Math.round((current.weight - previous.weight) * 10) / 10;
        // Seuil de 0.5 kg pour considérer "stable"
        if (weightDelta > 0.5) {
          weightTrend = 'up';
        } else if (weightDelta < -0.5) {
          weightTrend = 'down';
        } else {
          weightTrend = 'stable';
        }
      }

      result.set(animalId, {
        currentWeight: current.weight,
        lastWeighDate: current.date,
        previousWeight: previous?.weight ?? null,
        weightTrend,
        weightDelta,
      });
    });

    return result;
  }

  /**
   * Récupère les IDs des animaux selon les critères de poids
   */
  private async getAnimalIdsByWeightCriteria(
    farmId: string,
    notWeighedDays?: number,
    minWeight?: number,
    maxWeight?: number,
  ): Promise<string[]> {
    const now = new Date();

    if (notWeighedDays) {
      // Animaux non pesés depuis X jours
      const cutoffDate = new Date(now.getTime() - notWeighedDays * 24 * 60 * 60 * 1000);

      // Trouver les animaux dont le dernier poids est avant cutoffDate OU qui n'ont jamais été pesés
      const animalsWithRecentWeight = await this.prisma.weight.findMany({
        where: {
          farmId,
          deletedAt: null,
          weightDate: { gte: cutoffDate },
        },
        select: { animalId: true },
        distinct: ['animalId'],
      });

      const recentlyWeighedIds = animalsWithRecentWeight.map((w) => w.animalId);

      // Tous les animaux sauf ceux pesés récemment
      const allAnimals = await this.prisma.animal.findMany({
        where: { farmId, deletedAt: null },
        select: { id: true },
      });

      return allAnimals
        .map((a) => a.id)
        .filter((id) => !recentlyWeighedIds.includes(id));
    }

    if (minWeight !== undefined || maxWeight !== undefined) {
      // Filtrer sur le dernier poids de chaque animal
      // Utiliser une requête raw pour la performance
      const weightConditions: string[] = [];
      const params: (string | number)[] = [farmId];

      if (minWeight !== undefined) {
        params.push(minWeight);
        weightConditions.push(`lw.weight >= $${params.length}`);
      }

      if (maxWeight !== undefined) {
        params.push(maxWeight);
        weightConditions.push(`lw.weight <= $${params.length}`);
      }

      const whereClause = weightConditions.length > 0 ? `AND ${weightConditions.join(' AND ')}` : '';

      const result = await this.prisma.$queryRawUnsafe<{ animal_id: string }[]>(`
        WITH latest_weights AS (
          SELECT DISTINCT ON (animal_id)
            animal_id,
            weight,
            weight_date
          FROM weights
          WHERE farm_id = $1 AND deleted_at IS NULL
          ORDER BY animal_id, weight_date DESC
        )
        SELECT lw.animal_id
        FROM latest_weights lw
        WHERE 1=1 ${whereClause}
      `, ...params);

      return result.map((r) => r.animal_id);
    }

    return [];
  }

  async findOne(farmId: string, id: string) {
    this.logger.debug(`Finding animal ${id} in farm ${farmId}`);

    const animal = await this.prisma.animal.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        species: true,
        breed: true,
        mother: true,
        children: true,
      },
    });

    if (!animal) {
      this.logger.warn('Animal not found', { animalId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animal ${id} not found`,
        { animalId: id, farmId },
      );
    }

    return animal;
  }

  async update(farmId: string, id: string, dto: UpdateAnimalDto) {
    this.logger.debug(`Updating animal ${id} (version ${dto.version})`);

    const existing = await this.findOne(farmId, id);

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        animalId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          animalId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      const updated = await this.prisma.animal.update({
        where: { id },
        data: {
          ...(dto.currentLocationFarmId !== undefined && { currentLocationFarmId: dto.currentLocationFarmId }),
          ...(dto.currentEid !== undefined && { currentEid: dto.currentEid }),
          ...(dto.officialNumber !== undefined && { officialNumber: dto.officialNumber }),
          ...(dto.visualId !== undefined && { visualId: dto.visualId }),
          ...(dto.eidHistory !== undefined && { eidHistory: dto.eidHistory ? JSON.stringify(dto.eidHistory) : null }),
          ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
          ...(dto.sex && { sex: dto.sex }),
          ...(dto.motherId !== undefined && { motherId: dto.motherId }),
          ...(dto.fatherId !== undefined && { fatherId: dto.fatherId }),
          ...(dto.speciesId !== undefined && { speciesId: dto.speciesId }),
          ...(dto.breedId !== undefined && { breedId: dto.breedId }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.validatedAt !== undefined && { validatedAt: dto.validatedAt ? new Date(dto.validatedAt) : null }),
          ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.days !== undefined && { days: dto.days }),
          // CRITICAL: Use client timestamp if provided (offline-first)
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
          version: { increment: 1 },
        },
        include: {
          species: true,
          breed: true,
          mother: true,
        },
      });

      this.logger.audit('Animal updated', {
        animalId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update animal ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting animal ${id}`);

    await this.findOne(farmId, id);

    try {
      const deleted = await this.prisma.animal.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.audit('Animal soft deleted', {
        animalId: id,
        farmId,
      });

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete animal ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Get animal statistics for the farm with optional filters
   * Endpoint: GET /api/v1/farms/:farmId/animals/stats
   */
  async getStats(
    farmId: string,
    filters: {
      status?: string;
      speciesId?: string;
      breedId?: string;
      sex?: string;
      search?: string;
      notWeighedDays?: number;
      minWeight?: number;
      maxWeight?: number;
    } = {},
  ) {
    const notWeighedDays = filters.notWeighedDays || 30;
    this.logger.debug(`Getting animal stats for farm ${farmId}`, filters);

    // Construire le filtre de base
    const baseWhere: any = {
      farmId,
      deletedAt: null,
      ...(filters.status && { status: filters.status }),
      ...(filters.speciesId && { speciesId: filters.speciesId }),
      ...(filters.breedId && { breedId: filters.breedId }),
      ...(filters.sex && { sex: filters.sex }),
      ...(filters.search && {
        OR: [
          { currentEid: { contains: filters.search, mode: 'insensitive' as const } },
          { officialNumber: { contains: filters.search, mode: 'insensitive' as const } },
          { visualId: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Si filtres de poids, récupérer les IDs correspondants
    let weightFilteredIds: string[] | null = null;
    if (filters.minWeight !== undefined || filters.maxWeight !== undefined) {
      weightFilteredIds = await this.getAnimalIdsByWeightCriteria(
        farmId,
        undefined,
        filters.minWeight,
        filters.maxWeight,
      );
      if (weightFilteredIds.length === 0) {
        // Aucun animal ne correspond aux critères de poids
        return {
          total: 0,
          byStatus: { draft: 0, alive: 0, sold: 0, dead: 0, slaughtered: 0, onTemporaryMovement: 0 },
          bySex: { male: 0, female: 0 },
          notWeighedCount: 0,
          notWeighedDays,
        };
      }
      baseWhere.id = { in: weightFilteredIds };
    }

    // Compter par statut
    const byStatus = await this.prisma.animal.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { id: true },
    });

    // Compter par sexe
    const bySex = await this.prisma.animal.groupBy({
      by: ['sex'],
      where: baseWhere,
      _count: { id: true },
    });

    // Total
    const total = await this.prisma.animal.count({
      where: baseWhere,
    });

    // Animaux vivants non pesés depuis X jours
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - notWeighedDays);

    // Pour notWeighedCount, on filtre sur les animaux vivants dans le set filtré
    const aliveWhere = { ...baseWhere, status: 'alive' };

    // Animaux vivants avec pesée récente
    const animalsWithRecentWeight = await this.prisma.weight.findMany({
      where: {
        farmId,
        deletedAt: null,
        weightDate: { gte: cutoffDate },
        animal: aliveWhere,
      },
      select: { animalId: true },
      distinct: ['animalId'],
    });

    const recentlyWeighedIds = animalsWithRecentWeight.map((w) => w.animalId);

    // Compter les animaux vivants dans le set filtré
    const aliveCount = await this.prisma.animal.count({
      where: aliveWhere,
    });

    // Animaux vivants non pesés = alive filtré - ceux avec pesée récente
    const notWeighedCount = Math.max(0, aliveCount - recentlyWeighedIds.length);

    // Formater les résultats
    const statusMap: Record<string, number> = {
      draft: 0,
      alive: 0,
      sold: 0,
      dead: 0,
      slaughtered: 0,
      onTemporaryMovement: 0,
    };
    byStatus.forEach((s) => {
      statusMap[s.status] = s._count.id;
    });

    const sexMap: Record<string, number> = {
      male: 0,
      female: 0,
    };
    bySex.forEach((s) => {
      sexMap[s.sex] = s._count.id;
    });

    return {
      total,
      byStatus: statusMap,
      bySex: sexMap,
      notWeighedCount,
      notWeighedDays,
    };
  }
}
