import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLogger } from '../utils/logger.service';
import { EntityNotFoundException } from '../exceptions/not-found.exception';
import { ERROR_CODES } from '../constants/error-codes';

/**
 * Reusable service for batch CRUD operations
 * Handles atomic bulk inserts and animal verification
 */
@Injectable()
export class BatchOperationService {
  private readonly logger = new AppLogger(BatchOperationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create batch entities atomically
   * @param animalIds Array of animal IDs to create entities for
   * @param baseId Base ID for batch (used as prefix)
   * @param createDataFactory Function to create entity data per animal
   * @param modelName Prisma model name ('vaccination', 'treatment', etc.)
   * @param includeRelations Prisma include object for relations
   * @returns Created entities with relations
   */
  async createBatchEntities<T>(
    animalIds: string[],
    baseId: string | undefined,
    createDataFactory: (animalId: string, index: number) => any,
    modelName: string,
    includeRelations?: any,
  ): Promise<T[]> {
    const { randomUUID } = await import('crypto');
    const entityIds: string[] = [];

    // 1. Generate IDs and map data
    const insertData = animalIds.map((animalId, index) => {
      const entityId = baseId ? `${baseId}-${index}` : randomUUID();
      entityIds.push(entityId);
      return createDataFactory(animalId, index);
    });

    this.logger.debug(
      `Creating batch of ${insertData.length} ${modelName} entities`,
      { count: insertData.length, modelName },
    );

    // 2. Bulk insert
    await this.prisma[modelName].createMany({
      data: insertData,
      skipDuplicates: false,
    });

    // 3. Fetch with relations
    const entities = await this.prisma[modelName].findMany({
      where: { id: { in: entityIds } },
      ...(includeRelations && { include: includeRelations }),
    });

    this.logger.audit('Batch entities created', {
      modelName,
      count: entities.length,
      entityIds,
    });

    return entities as T[];
  }

  /**
   * Verify animals exist and belong to farm
   * @param animalIds Array of animal IDs to verify
   * @param farmId Farm ID the animals should belong to
   * @throws EntityNotFoundException if any animals not found
   */
  async verifyAnimals(
    animalIds: string[],
    farmId: string,
  ): Promise<{ id: string }[]> {
    const animals = await this.prisma.animal.findMany({
      where: { id: { in: animalIds }, farmId, deletedAt: null },
      select: { id: true },
    });

    if (animals.length !== animalIds.length) {
      this.logger.warn(
        `Animal verification failed: expected ${animalIds.length}, found ${animals.length}`,
      );

      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        'Some animals not found, deleted, or do not belong to this farm',
        { farmId, requestedCount: animalIds.length, foundCount: animals.length },
      );
    }

    return animals;
  }
}
