import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAnimalStatusDto,
  UpdateAnimalStatusDto,
  QueryAnimalStatusDto,
  CloseAnimalStatusDto,
  AnimalStatusType,
} from './dto';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class AnimalStatusService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau statut physiologique pour un animal
   */
  async create(farmId: string, animalId: string, dto: CreateAnimalStatusDto) {
    // Vérifier que l'animal existe et appartient à la ferme
    const animal = await this.prisma.animal.findFirst({
      where: {
        id: animalId,
        farmId,
        deletedAt: null,
      },
    });

    if (!animal) {
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animal with ID "${animalId}" not found in farm "${farmId}"`,
        { animalId, farmId },
      );
    }

    // Vérifier qu'il n'y a pas déjà un statut actif du même type
    const existingActiveStatus = await this.prisma.animalStatusHistory.findFirst({
      where: {
        animalId,
        statusType: dto.statusType as any,
        endDate: null,
        deletedAt: null,
      },
    });

    if (existingActiveStatus && !dto.endDate) {
      throw new EntityConflictException(
        ERROR_CODES.ENTITY_ALREADY_EXISTS,
        `An active ${dto.statusType} status already exists for this animal. Close the existing status before creating a new one.`,
        { animalId, statusType: dto.statusType, existingStatusId: existingActiveStatus.id },
      );
    }

    // Valider que startDate <= endDate si endDate fourni
    if (dto.endDate && new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('Start date must be before or equal to end date');
    }

    return this.prisma.animalStatusHistory.create({
      data: {
        animalId,
        statusType: dto.statusType as any,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        value: dto.value,
        notes: dto.notes,
      },
      include: {
        animal: {
          select: {
            id: true,
            currentEid: true,
            officialNumber: true,
          },
        },
      },
    });
  }

  /**
   * Liste paginée des statuts d'un animal
   */
  async findAll(farmId: string, animalId: string, query: QueryAnimalStatusDto) {
    // Vérifier que l'animal existe et appartient à la ferme
    const animal = await this.prisma.animal.findFirst({
      where: {
        id: animalId,
        farmId,
        deletedAt: null,
      },
    });

    if (!animal) {
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animal with ID "${animalId}" not found in farm "${farmId}"`,
        { animalId, farmId },
      );
    }

    const { statusType, activeOnly, page = 1, limit = 50 } = query;

    const where = {
      animalId,
      deletedAt: null,
      ...(statusType && { statusType: statusType as any }),
      ...(activeOnly && { endDate: null }),
    };

    const [statuses, total] = await Promise.all([
      this.prisma.animalStatusHistory.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.animalStatusHistory.count({ where }),
    ]);

    return {
      data: statuses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupérer tous les statuts actifs d'un animal
   */
  async findActive(farmId: string, animalId: string) {
    // Vérifier que l'animal existe et appartient à la ferme
    const animal = await this.prisma.animal.findFirst({
      where: {
        id: animalId,
        farmId,
        deletedAt: null,
      },
    });

    if (!animal) {
      throw new EntityNotFoundException(
        ERROR_CODES.ANIMAL_NOT_FOUND,
        `Animal with ID "${animalId}" not found in farm "${farmId}"`,
        { animalId, farmId },
      );
    }

    return this.prisma.animalStatusHistory.findMany({
      where: {
        animalId,
        endDate: null,
        deletedAt: null,
      },
      orderBy: { statusType: 'asc' },
    });
  }

  /**
   * Récupérer un statut par ID
   */
  async findOne(farmId: string, animalId: string, id: string) {
    const status = await this.prisma.animalStatusHistory.findFirst({
      where: {
        id,
        animalId,
        deletedAt: null,
        animal: {
          farmId,
          deletedAt: null,
        },
      },
      include: {
        animal: {
          select: {
            id: true,
            farmId: true,
            currentEid: true,
            officialNumber: true,
          },
        },
      },
    });

    if (!status) {
      throw new EntityNotFoundException(
        ERROR_CODES.ENTITY_NOT_FOUND,
        `Animal status with ID "${id}" not found`,
        { id, animalId, farmId },
      );
    }

    return status;
  }

  /**
   * Mettre à jour un statut
   */
  async update(farmId: string, animalId: string, id: string, dto: UpdateAnimalStatusDto) {
    // Vérifier que le statut existe
    await this.findOne(farmId, animalId, id);

    // Valider les dates si fournies
    if (dto.startDate && dto.endDate && new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('Start date must be before or equal to end date');
    }

    return this.prisma.animalStatusHistory.update({
      where: { id },
      data: {
        ...(dto.statusType && { statusType: dto.statusType as any }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        animal: {
          select: {
            id: true,
            currentEid: true,
            officialNumber: true,
          },
        },
      },
    });
  }

  /**
   * Clôturer un statut actif
   */
  async close(farmId: string, animalId: string, id: string, dto: CloseAnimalStatusDto) {
    // Vérifier que le statut existe
    const status = await this.findOne(farmId, animalId, id);

    // Vérifier que le statut n'est pas déjà clôturé
    if (status.endDate) {
      throw new BadRequestException('This status is already closed');
    }

    // Valider que endDate >= startDate
    if (new Date(dto.endDate) < status.startDate) {
      throw new BadRequestException('End date must be after or equal to start date');
    }

    return this.prisma.animalStatusHistory.update({
      where: { id },
      data: {
        endDate: new Date(dto.endDate),
        ...(dto.notes && { notes: dto.notes }),
      },
      include: {
        animal: {
          select: {
            id: true,
            currentEid: true,
            officialNumber: true,
          },
        },
      },
    });
  }

  /**
   * Supprimer un statut (soft delete)
   */
  async remove(farmId: string, animalId: string, id: string) {
    // Vérifier que le statut existe
    await this.findOne(farmId, animalId, id);

    return this.prisma.animalStatusHistory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Vérifier si un animal a un statut de gestation actif
   * Utilisé pour les alertes de contre-indication
   */
  async hasActiveGestation(animalId: string): Promise<boolean> {
    const gestation = await this.prisma.animalStatusHistory.findFirst({
      where: {
        animalId,
        statusType: 'GESTATION',
        endDate: null,
        deletedAt: null,
      },
    });
    return !!gestation;
  }

  /**
   * Récupérer le dernier poids enregistré pour un animal
   */
  async getLatestWeight(animalId: string): Promise<string | null> {
    const weight = await this.prisma.animalStatusHistory.findFirst({
      where: {
        animalId,
        statusType: 'WEIGHT',
        deletedAt: null,
      },
      orderBy: { startDate: 'desc' },
    });
    return weight?.value || null;
  }
}
