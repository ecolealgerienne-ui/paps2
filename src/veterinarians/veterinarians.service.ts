import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { DataScope } from '../common/types/prisma-types';

// Type pour les requêtes where sur Veterinarian (remplacement temporaire de Prisma.VeterinarianWhereInput)
type VeterinarianWhereInput = {
  id?: string;
  scope?: DataScope;
  farmId?: string | null;
  deletedAt?: null | Date;
  isActive?: boolean;
  isAvailable?: boolean;
  emergencyService?: boolean;
  department?: string;
  isDefault?: boolean;
  firstName?: { contains: string; mode: 'insensitive' };
  lastName?: { contains: string; mode: 'insensitive' };
  clinic?: { contains: string; mode: 'insensitive' };
  licenseNumber?: { contains: string; mode: 'insensitive' };
  OR?: VeterinarianWhereInput[];
};

/**
 * Service for managing Veterinarians (Master Table Pattern)
 * Supports both global (admin) and local (farm-specific) veterinarians
 */
@Injectable()
export class VeterinariansService {
  private readonly logger = new AppLogger(VeterinariansService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a local veterinarian for a farm
   * Local veterinarians have scope='local' and farmId set
   */
  async create(farmId: string, dto: CreateVeterinarianDto) {
    this.logger.debug(`Creating local veterinarian in farm ${farmId}`);

    try {
      const vet = await this.prisma.veterinarian.create({
        data: {
          ...dto,
          scope: DataScope.local,
          farmId,
        },
      });

      this.logger.audit('Veterinarian created', { veterinarianId: vet.id, farmId, scope: 'local' });
      return vet;
    } catch (error) {
      this.logger.error(`Failed to create veterinarian in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all veterinarians accessible to a farm
   * Returns global veterinarians + farm's local veterinarians
   * Supports filtering by scope (global, local, all)
   */
  async findAll(farmId: string, query: QueryVeterinarianDto) {
    const {
      search,
      scope = 'all',
      department,
      isActive,
      isAvailable,
      emergencyService,
      page = 1,
      limit = 50,
      sort = 'lastName',
      order = 'asc',
    } = query;

    // Build scope filter
    let scopeFilter: VeterinarianWhereInput;
    if (scope === 'global') {
      scopeFilter = { scope: DataScope.global };
    } else if (scope === 'local') {
      scopeFilter = { scope: DataScope.local, farmId };
    } else {
      // 'all' - return global + farm's local veterinarians
      scopeFilter = {
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      };
    }

    // Build complete where clause
    const where: VeterinarianWhereInput = {
      ...scopeFilter,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { clinic: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (department) {
      where.department = department;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }
    if (emergencyService !== undefined) {
      where.emergencyService = emergencyService;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.veterinarian.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      this.prisma.veterinarian.count({ where }),
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
   * Find a veterinarian by ID
   * Returns global veterinarians or farm's local veterinarians
   */
  async findOne(farmId: string, id: string) {
    const vet = await this.prisma.veterinarian.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
    });

    if (!vet) {
      this.logger.warn('Veterinarian not found', { veterinarianId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    return vet;
  }

  /**
   * Update a veterinarian
   * Only local veterinarians owned by the farm can be updated
   * Global veterinarians are read-only for farmers
   */
  async update(farmId: string, id: string, dto: UpdateVeterinarianDto) {
    this.logger.debug(`Updating veterinarian ${id}`);

    const existing = await this.prisma.veterinarian.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Veterinarian not found', { veterinarianId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    // Check if this is a global veterinarian (read-only for farmers)
    if (existing.scope === DataScope.global) {
      this.logger.warn('Cannot update global veterinarian', { veterinarianId: id, farmId });
      throw new ForbiddenException('Global veterinarians cannot be modified');
    }

    // Check if this local veterinarian belongs to the farm
    if (existing.farmId !== farmId) {
      this.logger.warn('Veterinarian belongs to another farm', { veterinarianId: id, farmId, ownerFarmId: existing.farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException(
        'Version conflict: the veterinarian has been modified by another user',
      );
    }

    try {
      const { version, ...updateData } = dto;

      const updated = await this.prisma.veterinarian.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Veterinarian updated', { veterinarianId: id, farmId });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update veterinarian ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a veterinarian
   * Only local veterinarians owned by the farm can be deleted
   * Global veterinarians cannot be deleted by farmers
   */
  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting veterinarian ${id}`);

    const existing = await this.prisma.veterinarian.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Veterinarian not found', { veterinarianId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    // Check if this is a global veterinarian (cannot be deleted by farmers)
    if (existing.scope === DataScope.global) {
      this.logger.warn('Cannot delete global veterinarian', { veterinarianId: id, farmId });
      throw new ForbiddenException('Global veterinarians cannot be deleted');
    }

    // Check if this local veterinarian belongs to the farm
    if (existing.farmId !== farmId) {
      this.logger.warn('Veterinarian belongs to another farm', { veterinarianId: id, farmId, ownerFarmId: existing.farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.veterinarian.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Veterinarian soft deleted', { veterinarianId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete veterinarian ${id}`, error.stack);
      throw error;
    }
  }

  // =============================================================================
  // Additional methods
  // =============================================================================

  /**
   * Find active veterinarians for a farm (global + local)
   */
  async findByFarm(farmId: string) {
    this.logger.debug(`Finding active veterinarians for farm ${farmId}`);
    return this.prisma.veterinarian.findMany({
      where: {
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
        isActive: true,
        deletedAt: null,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  /**
   * Find the default veterinarian for a farm
   */
  async findDefault(farmId: string) {
    this.logger.debug(`Finding default veterinarian for farm ${farmId}`);
    const defaultVet = await this.prisma.veterinarian.findFirst({
      where: {
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
        isDefault: true,
        deletedAt: null,
      },
    });

    if (!defaultVet) {
      this.logger.warn('No default veterinarian found', { farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `No default veterinarian found for farm ${farmId}`,
        { farmId },
      );
    }

    return defaultVet;
  }

  /**
   * Find veterinarians by department (global only, useful for discovery)
   */
  async findByDepartment(department: string) {
    this.logger.debug(`Finding veterinarians in department ${department}`);
    return this.prisma.veterinarian.findMany({
      where: {
        department,
        scope: DataScope.global, // Only return global vets for department search
        isActive: true,
        deletedAt: null,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  /**
   * Set a veterinarian as default for the farm
   * Only local veterinarians can be set as default
   */
  async setDefault(farmId: string, id: string) {
    this.logger.debug(`Setting veterinarian ${id} as default for farm ${farmId}`);

    const vet = await this.prisma.veterinarian.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { scope: DataScope.global },
          { scope: DataScope.local, farmId },
        ],
      },
    });

    if (!vet) {
      this.logger.warn('Veterinarian not found', { veterinarianId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    try {
      // First, unset all defaults for this farm's local veterinarians
      await this.prisma.veterinarian.updateMany({
        where: {
          farmId,
          scope: DataScope.local,
          isDefault: true,
          deletedAt: null,
        },
        data: { isDefault: false },
      });

      // Then set the new default (only if it's a local vet)
      if (vet.scope === DataScope.local && vet.farmId === farmId) {
        const updated = await this.prisma.veterinarian.update({
          where: { id },
          data: {
            isDefault: true,
            version: vet.version + 1,
          },
        });

        this.logger.audit('Default veterinarian set', { veterinarianId: id, farmId });
        return updated;
      }

      // For global vets, we can't set isDefault on the vet itself
      // Instead, this could be stored in a preference table if needed
      this.logger.audit('Veterinarian referenced as default', { veterinarianId: id, farmId, scope: vet.scope });
      return vet;
    } catch (error) {
      this.logger.error(`Failed to set default veterinarian ${id}`, error.stack);
      throw error;
    }
  }
}
