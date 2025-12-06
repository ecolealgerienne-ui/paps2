import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, DataScope } from '@prisma/client';
import { CreateVeterinarianDto, CreateGlobalVeterinarianDto, UpdateVeterinarianDto, QueryVeterinarianDto, VeterinarianResponseDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

export interface FindAllOptions {
  search?: string;
  scope?: 'global' | 'local' | 'all';
  department?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  emergencyService?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse {
  data: VeterinarianResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service for managing Veterinarians (PHASE_16 - Scope Pattern)
 * Supports both global (admin) and local (farm-specific) veterinarians
 */
@Injectable()
export class VeterinariansService {
  private readonly logger = new AppLogger(VeterinariansService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a local veterinarian for a farm
   * Local veterinarians have scope='local' and farmId set
   * Also adds the veterinarian to farm preferences
   */
  async create(farmId: string, dto: CreateVeterinarianDto): Promise<VeterinarianResponseDto> {
    this.logger.debug(`Creating local veterinarian in farm ${farmId}`);

    try {
      // Utiliser une transaction pour créer le vétérinaire et la préférence
      const result = await this.prisma.$transaction(async (tx) => {
        // Créer le vétérinaire
        const vet = await tx.veterinarian.create({
          data: {
            ...(dto.id && { id: dto.id }),
            scope: DataScope.local,
            farmId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            title: dto.title || null,
            licenseNumber: dto.licenseNumber || null,
            specialties: dto.specialties || null,
            clinic: dto.clinic || null,
            phone: dto.phone || null,
            mobile: dto.mobile || null,
            email: dto.email || null,
            address: dto.address || null,
            city: dto.city || null,
            postalCode: dto.postalCode || null,
            country: dto.country || null,
            department: dto.department || null,
            commune: dto.commune || null,
            isAvailable: dto.isAvailable ?? true,
            emergencyService: dto.emergencyService ?? false,
            workingHours: dto.workingHours || null,
            consultationFee: dto.consultationFee || null,
            emergencyFee: dto.emergencyFee || null,
            currency: dto.currency || null,
            notes: dto.notes || null,
            isPreferred: dto.isPreferred ?? false,
            isDefault: dto.isDefault ?? false,
            isActive: dto.isActive ?? true,
            ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
            ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
          },
        });

        // Calculer le displayOrder pour la nouvelle préférence
        const maxOrder = await tx.farmVeterinarianPreference.findFirst({
          where: { farmId, deletedAt: null },
          orderBy: { displayOrder: 'desc' },
          select: { displayOrder: true },
        });
        const displayOrder = (maxOrder?.displayOrder ?? -1) + 1;

        // Si isDefault=true, retirer le flag des autres préférences
        if (dto.isDefault) {
          await tx.farmVeterinarianPreference.updateMany({
            where: { farmId, isDefault: true, deletedAt: null },
            data: { isDefault: false },
          });
        }

        // Ajouter automatiquement aux préférences de la ferme
        await tx.farmVeterinarianPreference.create({
          data: {
            farmId,
            veterinarianId: vet.id,
            displayOrder,
            isActive: true,
            isDefault: dto.isDefault ?? false,
          },
        });

        return vet;
      });

      this.logger.audit('Veterinarian created', { veterinarianId: result.id, farmId, scope: 'local' });
      return result;
    } catch (error) {
      this.logger.error(`Failed to create veterinarian in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a global veterinarian (admin only)
   * Global veterinarians have scope='global' and farmId=null
   */
  async createGlobal(dto: CreateGlobalVeterinarianDto): Promise<VeterinarianResponseDto> {
    this.logger.debug(`Creating global veterinarian`);

    try {
      const vet = await this.prisma.veterinarian.create({
        data: {
          ...(dto.id && { id: dto.id }),
          scope: DataScope.global,
          farmId: null,
          firstName: dto.firstName,
          lastName: dto.lastName,
          title: dto.title || null,
          licenseNumber: dto.licenseNumber,
          specialties: dto.specialties || null,
          clinic: dto.clinic || null,
          phone: dto.phone || null,
          mobile: dto.mobile || null,
          email: dto.email || null,
          address: dto.address || null,
          city: dto.city || null,
          postalCode: dto.postalCode || null,
          country: dto.country || null,
          department: dto.department,
          commune: dto.commune || null,
          isAvailable: dto.isAvailable ?? true,
          emergencyService: dto.emergencyService ?? false,
          workingHours: dto.workingHours || null,
          consultationFee: dto.consultationFee || null,
          emergencyFee: dto.emergencyFee || null,
          currency: dto.currency || null,
          notes: dto.notes || null,
          isPreferred: dto.isPreferred ?? false,
          isDefault: false,
          isActive: dto.isActive ?? true,
          ...(dto.created_at && { createdAt: new Date(dto.created_at) }),
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
        },
      });

      this.logger.audit('Global veterinarian created', { veterinarianId: vet.id, scope: 'global' });
      return vet;
    } catch (error) {
      this.logger.error(`Failed to create global veterinarian`, error.stack);
      throw error;
    }
  }

  /**
   * Find all veterinarians for a farm with filters, search, and pagination
   * Returns global veterinarians + farm's local veterinarians
   */
  async findAll(farmId: string, query: QueryVeterinarianDto): Promise<PaginatedResponse> {
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
    const where: Prisma.VeterinarianWhereInput = { deletedAt: null };

    if (scope === 'global') {
      where.scope = DataScope.global;
    } else if (scope === 'local') {
      where.scope = DataScope.local;
      where.farmId = farmId;
    } else {
      // 'all' - return global + farm's local veterinarians
      where.OR = [
        { scope: DataScope.global },
        { scope: DataScope.local, farmId },
      ];
    }

    // Other filters
    if (department) where.department = department;
    if (isActive !== undefined) where.isActive = isActive;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (emergencyService !== undefined) where.emergencyService = emergencyService;

    // Search in multiple fields
    if (search) {
      const searchCondition: Prisma.VeterinarianWhereInput = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { clinic: { contains: search, mode: 'insensitive' } },
          { licenseNumber: { contains: search, mode: 'insensitive' } },
        ],
      };

      // Combine search with existing filters
      if (where.OR) {
        // If we have scope OR, wrap everything in AND
        where.AND = [
          { OR: where.OR },
          searchCondition,
        ];
        delete where.OR;
      } else {
        // Otherwise, use the search OR directly
        where.OR = searchCondition.OR;
      }
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

    this.logger.debug(`Found ${total} veterinarians for farm ${farmId} (page ${page}/${Math.ceil(total / limit)})`);

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
   * Find a single veterinarian by ID (scope-aware)
   * Returns global veterinarians or farm's local veterinarians
   */
  async findOne(farmId: string, id: string): Promise<VeterinarianResponseDto> {
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
  async update(farmId: string, id: string, dto: UpdateVeterinarianDto): Promise<VeterinarianResponseDto> {
    this.logger.debug(`Updating veterinarian ${id}`);

    const existing = await this.prisma.veterinarian.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
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
      const updated = await this.prisma.veterinarian.update({
        where: { id },
        data: {
          firstName: dto.firstName !== undefined ? dto.firstName : existing.firstName,
          lastName: dto.lastName !== undefined ? dto.lastName : existing.lastName,
          title: dto.title !== undefined ? dto.title : existing.title,
          licenseNumber: dto.licenseNumber !== undefined ? dto.licenseNumber : existing.licenseNumber,
          specialties: dto.specialties !== undefined ? dto.specialties : existing.specialties,
          clinic: dto.clinic !== undefined ? dto.clinic : existing.clinic,
          phone: dto.phone !== undefined ? dto.phone : existing.phone,
          mobile: dto.mobile !== undefined ? dto.mobile : existing.mobile,
          email: dto.email !== undefined ? dto.email : existing.email,
          address: dto.address !== undefined ? dto.address : existing.address,
          city: dto.city !== undefined ? dto.city : existing.city,
          postalCode: dto.postalCode !== undefined ? dto.postalCode : existing.postalCode,
          country: dto.country !== undefined ? dto.country : existing.country,
          department: dto.department !== undefined ? dto.department : existing.department,
          commune: dto.commune !== undefined ? dto.commune : existing.commune,
          isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : existing.isAvailable,
          emergencyService: dto.emergencyService !== undefined ? dto.emergencyService : existing.emergencyService,
          workingHours: dto.workingHours !== undefined ? dto.workingHours : existing.workingHours,
          consultationFee: dto.consultationFee !== undefined ? dto.consultationFee : existing.consultationFee,
          emergencyFee: dto.emergencyFee !== undefined ? dto.emergencyFee : existing.emergencyFee,
          currency: dto.currency !== undefined ? dto.currency : existing.currency,
          notes: dto.notes !== undefined ? dto.notes : existing.notes,
          isPreferred: dto.isPreferred !== undefined ? dto.isPreferred : existing.isPreferred,
          isDefault: dto.isDefault !== undefined ? dto.isDefault : existing.isDefault,
          rating: dto.rating !== undefined ? dto.rating : existing.rating,
          isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
          version: existing.version + 1,
          ...(dto.updated_at && { updatedAt: new Date(dto.updated_at) }),
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
   */
  async remove(farmId: string, id: string): Promise<VeterinarianResponseDto> {
    this.logger.debug(`Soft deleting veterinarian ${id}`);

    const existing = await this.prisma.veterinarian.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    if (existing.scope === DataScope.global) {
      throw new ForbiddenException('Global veterinarians cannot be deleted');
    }

    if (existing.farmId !== farmId) {
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    // Check dependencies before deleting
    const treatmentsCount = await this.prisma.treatment.count({
      where: { veterinarianId: id, deletedAt: null },
    });

    if (treatmentsCount > 0) {
      throw new ConflictException(
        `Cannot delete veterinarian: ${treatmentsCount} treatment(s) depend on it`,
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

  /**
   * Restore a soft-deleted veterinarian (farm-scoped)
   * Only local veterinarians owned by the farm can be restored
   */
  async restore(farmId: string, id: string): Promise<VeterinarianResponseDto> {
    this.logger.debug(`Restoring veterinarian ${id}`);

    const vet = await this.prisma.veterinarian.findFirst({
      where: {
        id,
        scope: DataScope.local,
        farmId,
      },
    });

    if (!vet) {
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id, farmId },
      );
    }

    if (!vet.deletedAt) {
      throw new ConflictException(`Veterinarian \"${vet.firstName} ${vet.lastName}\" is not deleted`);
    }

    const restored = await this.prisma.veterinarian.update({
      where: { id },
      data: {
        deletedAt: null,
        version: vet.version + 1,
      },
    });

    this.logger.audit('Veterinarian restored', { veterinarianId: id, farmId });
    return restored;
  }

  // =============================================================================
  // Additional methods
  // =============================================================================

  /**
   * Find active veterinarians for a farm (global + local)
   */
  async findByFarm(farmId: string): Promise<VeterinarianResponseDto[]> {
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
  async findDefault(farmId: string): Promise<VeterinarianResponseDto> {
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
  async findByDepartment(department: string): Promise<VeterinarianResponseDto[]> {
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
  async setDefault(farmId: string, id: string): Promise<VeterinarianResponseDto> {
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

  // =============================================================================
  // Global endpoints (no farm scope required)
  // =============================================================================

  /**
   * Find all global veterinarians (no farm scope required)
   * Returns only global veterinarians (scope='global')
   */
  async findAllGlobal(query: QueryVeterinarianDto): Promise<PaginatedResponse> {
    const {
      search,
      department,
      isActive,
      isAvailable,
      emergencyService,
      page = 1,
      limit = 50,
      sort = 'lastName',
      order = 'asc',
    } = query;

    // Build where clause for global veterinarians only
    const where: Prisma.VeterinarianWhereInput = {
      scope: DataScope.global,
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
    if (department) where.department = department;
    if (isActive !== undefined) where.isActive = isActive;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (emergencyService !== undefined) where.emergencyService = emergencyService;

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

    this.logger.debug(`Found ${total} global veterinarians (page ${page}/${Math.ceil(total / limit)})`);

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
   * Find a global veterinarian by ID (no farm scope required)
   */
  async findOneGlobal(id: string): Promise<VeterinarianResponseDto> {
    const vet = await this.prisma.veterinarian.findFirst({
      where: {
        id,
        scope: DataScope.global,
        deletedAt: null,
      },
    });

    if (!vet) {
      this.logger.warn('Global veterinarian not found', { veterinarianId: id });
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id },
      );
    }

    return vet;
  }

  /**
   * Restore a soft-deleted global veterinarian (admin only)
   */
  async restoreGlobal(id: string): Promise<VeterinarianResponseDto> {
    this.logger.debug(`Restoring global veterinarian ${id}`);

    const vet = await this.prisma.veterinarian.findFirst({
      where: {
        id,
        scope: DataScope.global,
      },
    });

    if (!vet) {
      throw new EntityNotFoundException(
        ERROR_CODES.VETERINARIAN_NOT_FOUND,
        `Veterinarian ${id} not found`,
        { veterinarianId: id },
      );
    }

    if (!vet.deletedAt) {
      throw new ConflictException(`Veterinarian \"${vet.firstName} ${vet.lastName}\" is not deleted`);
    }

    const restored = await this.prisma.veterinarian.update({
      where: { id },
      data: {
        deletedAt: null,
        version: vet.version + 1,
      },
    });

    this.logger.audit('Global veterinarian restored', { veterinarianId: id });
    return restored;
  }
}
