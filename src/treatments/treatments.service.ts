import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreatmentDto, UpdateTreatmentDto, QueryTreatmentDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { AlertEngineService } from '../farm-alerts/alert-engine/alert-engine.service';

@Injectable()
export class TreatmentsService {
  private readonly logger = new AppLogger(TreatmentsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AlertEngineService))
    private alertEngineService: AlertEngineService,
  ) {}

  /**
   * Trigger alert regeneration after treatment changes (non-blocking)
   */
  private triggerAlertRegeneration(farmId: string): void {
    this.alertEngineService.invalidateAndRegenerate(farmId).catch((err) => {
      this.logger.error(`Alert regeneration failed for farm ${farmId}`, err.stack);
    });
  }

  /**
   * Calculate withdrawal dates from product's simplified fields
   */
  calculateWithdrawalDates(
    treatmentDate: Date,
    product: { withdrawalMeatDays: number | null; withdrawalMilkHours: number | null },
  ) {
    const meatDays = product.withdrawalMeatDays ?? 0;
    const milkHours = product.withdrawalMilkHours ?? 0;
    const milkDays = Math.ceil(milkHours / 24);

    const computedWithdrawalMeatDate = meatDays > 0
      ? new Date(treatmentDate.getTime() + meatDays * 24 * 60 * 60 * 1000)
      : null;

    const computedWithdrawalMilkDate = milkHours > 0
      ? new Date(treatmentDate.getTime() + milkHours * 60 * 60 * 1000)
      : null;

    // withdrawalEndDate = max of meat and milk dates
    const maxDays = Math.max(meatDays, milkDays);
    const withdrawalEndDate = new Date(treatmentDate.getTime() + maxDays * 24 * 60 * 60 * 1000);

    return {
      computedWithdrawalMeatDate,
      computedWithdrawalMilkDate,
      withdrawalEndDate,
    };
  }

  async create(farmId: string, dto: CreateTreatmentDto) {
    // Determine which animals to treat: batch (animal_ids) or single (animalId)
    const animalIds = dto.animal_ids?.length
      ? dto.animal_ids
      : dto.animalId
        ? [dto.animalId]
        : [];

    if (animalIds.length === 0) {
      this.logger.warn('No animal ID provided for treatment', { farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_ANIMAL_NOT_FOUND,
        'At least one animal ID must be provided (animalId or animal_ids)',
        { farmId },
      );
    }

    const isBatchTreatment = animalIds.length > 1;
    this.logger.debug(`Creating ${isBatchTreatment ? 'batch' : 'single'} treatment for ${animalIds.length} animal(s) in farm ${farmId}`);

    // Verify all animals belong to farm
    const animals = await this.prisma.animal.findMany({
      where: { id: { in: animalIds }, farmId, deletedAt: null },
    });

    if (animals.length !== animalIds.length) {
      this.logger.warn('One or more animals not found for treatment', {
        farmId,
        expected: animalIds.length,
        found: animals.length
      });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_ANIMAL_NOT_FOUND,
        `One or more animals not found (expected ${animalIds.length}, found ${animals.length})`,
        { farmId, expectedCount: animalIds.length, foundCount: animals.length },
      );
    }

    // Validate farmerLotId if provided
    if (dto.farmerLotId) {
      const farmerLot = await this.prisma.farmerProductLot.findFirst({
        where: {
          id: dto.farmerLotId,
          deletedAt: null,
          config: {
            farmId,
          },
        },
      });

      if (!farmerLot) {
        throw new EntityNotFoundException(
          ERROR_CODES.ENTITY_NOT_FOUND,
          `Farmer lot with ID "${dto.farmerLotId}" not found or does not belong to this farm`,
          { farmerLotId: dto.farmerLotId, farmId },
        );
      }
    }

    try {
      // Destructure to exclude BaseSyncEntityDto fields and handle them explicitly
      const {
        farmId: dtoFarmId,
        created_at,
        updated_at,
        animal_ids,
        animalId,
        id,
        autoCalculateWithdrawal,
        batchExpiryDate,
        nextDueDate,
        ...treatmentData
      } = dto;

      const treatmentDate = new Date(dto.treatmentDate);
      const finalNextDueDate = nextDueDate ? new Date(nextDueDate) : null;

      // Calculate withdrawal dates from product if requested
      let withdrawalDates: { computedWithdrawalMeatDate: Date | null; computedWithdrawalMilkDate: Date | null; withdrawalEndDate: Date } | null = null;
      if (autoCalculateWithdrawal && dto.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: dto.productId },
          select: { withdrawalMeatDays: true, withdrawalMilkHours: true },
        });
        if (product) {
          withdrawalDates = this.calculateWithdrawalDates(treatmentDate, product);
          this.logger.debug('Auto-calculated withdrawal dates from product', {
            productId: dto.productId,
            meatDate: withdrawalDates.computedWithdrawalMeatDate,
            milkDate: withdrawalDates.computedWithdrawalMilkDate,
          });
        }
      }

      // Use calculated dates or fallback to provided date
      const finalWithdrawalEndDate = withdrawalDates?.withdrawalEndDate
        ?? (dto.withdrawalEndDate ? new Date(dto.withdrawalEndDate) : treatmentDate);

      // For batch treatments, use transaction for atomicity
      if (isBatchTreatment) {
        const { randomUUID } = await import('crypto');
        const treatmentIds: string[] = [];

        // Prepare insert data
        const insertData = animalIds.map((animalId, index) => {
          const treatmentId = id ? `${id}-${index}` : randomUUID();
          treatmentIds.push(treatmentId);

          return {
            id: treatmentId,
            ...treatmentData,
            animalId,
            farmId: dtoFarmId || farmId,
            treatmentDate,
            withdrawalEndDate: finalWithdrawalEndDate,
            computedWithdrawalMeatDate: withdrawalDates?.computedWithdrawalMeatDate,
            computedWithdrawalMilkDate: withdrawalDates?.computedWithdrawalMilkDate,
            ...(batchExpiryDate && { batchExpiryDate: new Date(batchExpiryDate) }),
            ...(finalNextDueDate && { nextDueDate: finalNextDueDate }),
            // CRITICAL: Use client timestamps if provided (offline-first)
            ...(created_at && { createdAt: new Date(created_at) }),
            ...(updated_at && { updatedAt: new Date(updated_at) }),
          };
        });

        // Transaction for atomic batch creation
        const treatments = await this.prisma.$transaction(async (tx) => {
          // 1. Bulk insert with createMany
          await tx.treatment.createMany({
            data: insertData,
            skipDuplicates: false,
          });

          // 2. Fetch created treatments with relations
          return tx.treatment.findMany({
            where: {
              id: { in: treatmentIds },
            },
            include: {
              animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
              product: true,
              veterinarian: true,
              farmerLot: {
                select: {
                  id: true,
                  nickname: true,
                  officialLotNumber: true,
                  expiryDate: true,
                },
              },
              lot: { select: { id: true, name: true } },
            },
          });
        });

        this.logger.audit('Batch treatments created', {
          count: treatments.length,
          farmId,
          animalIds,
          autoCalculated: !!withdrawalDates,
        });

        // Trigger alert regeneration
        this.triggerAlertRegeneration(farmId);

        return treatments;
      }

      // Single treatment
      const treatment = await this.prisma.treatment.create({
        data: {
          ...(id && { id }),
          ...treatmentData,
          animalId: animalIds[0],
          farmId: dtoFarmId || farmId,
          treatmentDate,
          withdrawalEndDate: finalWithdrawalEndDate,
          computedWithdrawalMeatDate: withdrawalDates?.computedWithdrawalMeatDate,
          computedWithdrawalMilkDate: withdrawalDates?.computedWithdrawalMilkDate,
          ...(batchExpiryDate && { batchExpiryDate: new Date(batchExpiryDate) }),
          ...(finalNextDueDate && { nextDueDate: finalNextDueDate }),
          // CRITICAL: Use client timestamps if provided (offline-first)
          ...(created_at && { createdAt: new Date(created_at) }),
          ...(updated_at && { updatedAt: new Date(updated_at) }),
        },
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
          product: true,
          veterinarian: true,
          farmerLot: {
            select: {
              id: true,
              nickname: true,
              officialLotNumber: true,
              expiryDate: true,
            },
          },
          lot: { select: { id: true, name: true } },
        },
      });

      this.logger.audit('Treatment created', {
        treatmentId: treatment.id,
        animalId: animalIds[0],
        farmId,
        autoCalculated: !!withdrawalDates,
      });

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

      return treatment;
    } catch (error) {
      this.logger.error(`Failed to create treatment${isBatchTreatment ? 's' : ''} in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryTreatmentDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.animalId) where.animalId = query.animalId;
    if (query.type) where.type = query.type;
    if (query.productId) where.productId = query.productId;
    if (query.lotId) where.lotId = query.lotId;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.treatmentDate = {};
      if (query.fromDate) where.treatmentDate.gte = new Date(query.fromDate);
      if (query.toDate) where.treatmentDate.lte = new Date(query.toDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 50;

    const [total, data] = await Promise.all([
      this.prisma.treatment.count({ where }),
      this.prisma.treatment.findMany({
        where,
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
          product: { select: { id: true, nameFr: true } },
          veterinarian: { select: { id: true, firstName: true, lastName: true } },
          farmerLot: {
            select: {
              id: true,
              nickname: true,
              officialLotNumber: true,
              expiryDate: true,
            },
          },
          lot: { select: { id: true, name: true } },
        },
        orderBy: { treatmentDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find all treatments for a specific animal
   * Endpoint: GET /api/v1/farms/:farmId/animals/:animalId/treatments
   */
  async findByAnimalId(farmId: string, animalId: string, query: QueryTreatmentDto) {
    // Verify animal exists and belongs to farm
    const animal = await this.prisma.animal.findFirst({
      where: { id: animalId, farmId, deletedAt: null },
    });

    if (!animal) {
      this.logger.warn('Animal not found', { animalId, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animal ${animalId} not found`,
        { animalId, farmId },
      );
    }

    const where: any = {
      farmId,
      animalId,
      deletedAt: null,
    };

    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.treatmentDate = {};
      if (query.fromDate) where.treatmentDate.gte = new Date(query.fromDate);
      if (query.toDate) where.treatmentDate.lte = new Date(query.toDate);
    }

    const treatments = await this.prisma.treatment.findMany({
      where,
      include: {
        product: { select: { id: true, nameFr: true, nameEn: true, withdrawalMeatDays: true, withdrawalMilkHours: true } },
        veterinarian: { select: { id: true, firstName: true, lastName: true } },
        farmerLot: {
          select: {
            id: true,
            nickname: true,
            officialLotNumber: true,
            expiryDate: true,
          },
        },
        lot: { select: { id: true, name: true } },
      },
      orderBy: { treatmentDate: 'desc' },
    });

    this.logger.debug(`Found ${treatments.length} treatments for animal ${animalId}`);
    return treatments;
  }

  async findOne(farmId: string, id: string) {
    const treatment = await this.prisma.treatment.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
        product: true,
        veterinarian: true,
        farmerLot: {
          select: {
            id: true,
            nickname: true,
            officialLotNumber: true,
            expiryDate: true,
          },
        },
        lot: { select: { id: true, name: true } },
      },
    });

    if (!treatment) {
      this.logger.warn('Treatment not found', { treatmentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_NOT_FOUND,
        `Treatment ${id} not found`,
        { treatmentId: id, farmId },
      );
    }

    return treatment;
  }

  async update(farmId: string, id: string, dto: UpdateTreatmentDto) {
    this.logger.debug(`Updating treatment ${id} (version ${dto.version})`);

    const existing = await this.prisma.treatment.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Treatment not found', { treatmentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_NOT_FOUND,
        `Treatment ${id} not found`,
        { treatmentId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        treatmentId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          treatmentId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      // Destructure to exclude BaseSyncEntityDto fields and date fields that need conversion
      const {
        farmId: dtoFarmId,
        created_at,
        updated_at,
        version,
        treatmentDate,
        withdrawalEndDate,
        nextDueDate,
        batchExpiryDate,
        ...treatmentData
      } = dto;

      const updateData: any = {
        ...treatmentData,
        version: existing.version + 1,
      };

      // Convert date strings to Date objects
      if (treatmentDate) updateData.treatmentDate = new Date(treatmentDate);
      if (withdrawalEndDate) updateData.withdrawalEndDate = new Date(withdrawalEndDate);
      if (nextDueDate) updateData.nextDueDate = new Date(nextDueDate);
      if (batchExpiryDate) updateData.batchExpiryDate = new Date(batchExpiryDate);
      // CRITICAL: Use client timestamp if provided (offline-first)
      if (updated_at) updateData.updatedAt = new Date(updated_at);

      const updated = await this.prisma.treatment.update({
        where: { id },
        data: updateData,
        include: {
          animal: { select: { id: true, visualId: true, currentEid: true, officialNumber: true } },
          product: true,
          veterinarian: true,
          farmerLot: {
            select: {
              id: true,
              nickname: true,
              officialLotNumber: true,
              expiryDate: true,
            },
          },
          lot: { select: { id: true, name: true } },
        },
      });

      this.logger.audit('Treatment updated', {
        treatmentId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update treatment ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting treatment ${id}`);

    const existing = await this.prisma.treatment.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      this.logger.warn('Treatment not found', { treatmentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.TREATMENT_NOT_FOUND,
        `Treatment ${id} not found`,
        { treatmentId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.treatment.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Treatment soft deleted', { treatmentId: id, farmId });

      // Trigger alert regeneration
      this.triggerAlertRegeneration(farmId);

      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete treatment ${id}`, error.stack);
      throw error;
    }
  }
}
