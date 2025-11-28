import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto, UpdateFarmDto, QueryFarmDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class FarmsService {
  private readonly logger = new AppLogger(FarmsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Créer une nouvelle ferme (PHASE_03)
   */
  async create(dto: CreateFarmDto) {
    this.logger.debug(`Creating farm`, { name: dto.name, ownerId: dto.ownerId });

    // Valider les codes géographiques si fournis
    this.validateGeoCodes(dto);

    try {
      // Si c'est la première ferme de l'utilisateur, la marquer par défaut
      const existingCount = await this.prisma.farm.count({
        where: { ownerId: dto.ownerId, deletedAt: null },
      });

      const isDefault = existingCount === 0 ? true : dto.isDefault ?? false;

      // Si isDefault=true, retirer le flag des autres fermes
      if (isDefault) {
        await this.prisma.farm.updateMany({
          where: { ownerId: dto.ownerId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const farm = await this.prisma.farm.create({
        data: {
          id: dto.id,
          name: dto.name,
          ownerId: dto.ownerId,
          address: dto.address,
          postalCode: dto.postalCode,
          city: dto.city,
          country: dto.country,
          department: dto.department,
          commune: dto.commune,
          latitude: dto.latitude,
          longitude: dto.longitude,
          location: dto.location,
          cheptelNumber: dto.cheptelNumber,
          groupId: dto.groupId,
          groupName: dto.groupName,
          isDefault,
          isActive: dto.isActive ?? true,
        },
        include: {
          _count: {
            select: {
              animals: true,
              lots: true,
              veterinarians: true,
            },
          },
        },
      });

      this.logger.audit('Farm created', { farmId: farm.id, name: farm.name });
      return farm;
    } catch (error) {
      this.logger.error(`Failed to create farm`, error.stack);
      throw error;
    }
  }

  /**
   * Récupérer toutes les fermes avec filtres (PHASE_03)
   */
  async findAll(query: QueryFarmDto) {
    const where: any = {};

    // Filtres de base
    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.groupId) where.groupId = query.groupId;
    if (query.isDefault !== undefined) where.isDefault = query.isDefault;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.country) where.country = query.country;
    if (query.department) where.department = query.department;

    // Soft delete filter
    if (!query.includeDeleted) {
      where.deletedAt = null;
    }

    // Recherche textuelle
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' as const } },
        { location: { contains: query.search, mode: 'insensitive' as const } },
        { address: { contains: query.search, mode: 'insensitive' as const } },
        { city: { contains: query.search, mode: 'insensitive' as const } },
      ];
    }

    return this.prisma.farm.findMany({
      where,
      include: {
        preferences: true,
        _count: {
          select: {
            animals: true,
            lots: true,
            veterinarians: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Récupérer une ferme par ID (PHASE_03)
   */
  async findOne(id: string, includeStats = false) {
    this.logger.debug(`Finding farm ${id}`, { includeStats });

    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: {
        preferences: true,
        ...(includeStats && {
          _count: {
            select: {
              animals: true,
              lots: true,
              movements: true,
              personalCampaigns: true,
              treatments: true,
              breedings: true,
              weights: true,
              documents: true,
              veterinarians: true,
              alertConfigurations: true,
            },
          },
        }),
      },
    });

    if (!farm || farm.deletedAt) {
      this.logger.warn('Farm not found or deleted', { farmId: id });
      throw new EntityNotFoundException(
        ERROR_CODES.ENTITY_NOT_FOUND,
        `Farm ${id} not found`,
        { farmId: id },
      );
    }

    return farm;
  }

  /**
   * Récupérer les fermes d'un utilisateur (PHASE_03)
   */
  async findByOwner(ownerId: string, includeDeleted = false) {
    return this.prisma.farm.findMany({
      where: {
        ownerId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        preferences: true,
        _count: {
          select: {
            animals: true,
            lots: true,
            veterinarians: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Récupérer la ferme par défaut d'un utilisateur (PHASE_03)
   */
  async findDefault(ownerId: string) {
    const farm = await this.prisma.farm.findFirst({
      where: {
        ownerId,
        isDefault: true,
        deletedAt: null,
      },
    });

    if (!farm) {
      this.logger.warn('No default farm found', { ownerId });
      throw new NotFoundException(`No default farm found for user ${ownerId}`);
    }

    return farm;
  }

  /**
   * Recherche géographique (PHASE_03)
   */
  async findByLocation(country?: string, department?: string) {
    const where: any = { deletedAt: null };

    if (country) {
      // Valider format ISO
      if (!/^[A-Z]{2}$/.test(country)) {
        throw new BadRequestException('Country must be ISO 3166-1 alpha-2 (ex: FR, DZ)');
      }
      where.country = country;
    }

    if (department) {
      if (!/^[0-9A-Z]{2,3}$/.test(department)) {
        throw new BadRequestException('Invalid department format');
      }
      where.department = department;
    }

    return this.prisma.farm.findMany({
      where,
      include: {
        _count: {
          select: {
            animals: true,
          },
        },
      },
      orderBy: [
        { country: 'asc' },
        { department: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Mettre à jour une ferme (PHASE_03)
   */
  async update(id: string, dto: UpdateFarmDto) {
    this.logger.debug(`Updating farm ${id}`);

    // Vérifier que la ferme existe
    const existing = await this.findOne(id);

    // Valider géo codes
    this.validateGeoCodes(dto);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      this.logger.warn('Version conflict detected', { farmId: id, expected: existing.version, received: dto.version });
      throw new ConflictException('Version conflict: the farm has been modified by another user');
    }

    try {
      // Si isDefault=true, retirer le flag des autres
      if (dto.isDefault === true) {
        await this.prisma.farm.updateMany({
          where: {
            ownerId: existing.ownerId,
            id: { not: id },
            isDefault: true,
          },
          data: { isDefault: false },
        });
      }

      const updated = await this.prisma.farm.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
          ...(dto.city !== undefined && { city: dto.city }),
          ...(dto.country !== undefined && { country: dto.country }),
          ...(dto.department !== undefined && { department: dto.department }),
          ...(dto.commune !== undefined && { commune: dto.commune }),
          ...(dto.latitude !== undefined && { latitude: dto.latitude }),
          ...(dto.longitude !== undefined && { longitude: dto.longitude }),
          ...(dto.location !== undefined && { location: dto.location }),
          ...(dto.ownerId !== undefined && { ownerId: dto.ownerId }),
          ...(dto.cheptelNumber !== undefined && { cheptelNumber: dto.cheptelNumber }),
          ...(dto.groupId !== undefined && { groupId: dto.groupId }),
          ...(dto.groupName !== undefined && { groupName: dto.groupName }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          version: existing.version + 1,
        },
        include: {
          _count: {
            select: {
              animals: true,
              lots: true,
              veterinarians: true,
            },
          },
        },
      });

      this.logger.audit('Farm updated', { farmId: id, name: updated.name });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update farm ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Activer/désactiver une ferme (PHASE_03)
   */
  async toggleActive(id: string, isActive: boolean) {
    this.logger.debug(`Toggling farm ${id} active status to ${isActive}`);

    const existing = await this.findOne(id);

    // Empêcher désactivation de la ferme par défaut
    if (!isActive && existing.isDefault) {
      this.logger.warn('Cannot deactivate default farm', { farmId: id });
      throw new ConflictException('Cannot deactivate default farm. Set another farm as default first.');
    }

    try {
      const updated = await this.prisma.farm.update({
        where: { id },
        data: {
          isActive,
          version: existing.version + 1,
        },
      });

      this.logger.audit(`Farm ${isActive ? 'activated' : 'deactivated'}`, { farmId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to toggle farm ${id} active status`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete d'une ferme (PHASE_03)
   */
  async remove(id: string) {
    this.logger.debug(`Soft deleting farm ${id}`);

    const existing = await this.findOne(id);

    // Empêcher suppression de la ferme par défaut
    if (existing.isDefault) {
      this.logger.warn('Cannot delete default farm', { farmId: id });
      throw new ConflictException('Cannot delete default farm. Set another farm as default first.');
    }

    // Vérifier si a des animaux actifs
    const activeAnimalsCount = await this.prisma.animal.count({
      where: { farmId: id, deletedAt: null },
    });

    if (activeAnimalsCount > 0) {
      this.logger.warn('Cannot delete farm with active animals', { farmId: id, activeAnimalsCount });
      throw new ConflictException(
        `Cannot delete farm: ${activeAnimalsCount} active animals. Delete animals first or deactivate farm.`
      );
    }

    try {
      const deleted = await this.prisma.farm.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Farm soft deleted', { farmId: id, name: deleted.name });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete farm ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Validation des codes géographiques (PHASE_03)
   */
  private validateGeoCodes(dto: Partial<CreateFarmDto | UpdateFarmDto>) {
    if (dto.country && !/^[A-Z]{2}$/.test(dto.country)) {
      throw new BadRequestException('Country must be ISO 3166-1 alpha-2 (ex: FR, DZ, MA)');
    }

    if (dto.department && !/^[0-9A-Z]{2,3}$/.test(dto.department)) {
      throw new BadRequestException('Department must be 2-3 characters (ex: 81, 2A, 974)');
    }

    if (dto.commune && !/^[0-9]{5}$/.test(dto.commune)) {
      throw new BadRequestException('Commune must be 5 digits (ex: 81004)');
    }
  }
}
