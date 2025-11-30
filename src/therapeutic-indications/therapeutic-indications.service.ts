import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTherapeuticIndicationDto,
  UpdateTherapeuticIndicationDto,
  QueryTherapeuticIndicationDto,
  TherapeuticIndicationResponseDto,
} from './dto';
import { AppLogger } from '../common/utils/logger.service';

export interface FindAllOptions {
  page?: number;
  limit?: number;
  productId?: string;
  speciesId?: string;
  countryCode?: string;
  routeId?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface PaginatedResponse {
  data: TherapeuticIndicationResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service for managing Therapeutic Indications (PHASE_10)
 * Contains withdrawal times and dosage information per product/species/route
 */
@Injectable()
export class TherapeuticIndicationsService {
  private readonly logger = new AppLogger(TherapeuticIndicationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTherapeuticIndicationDto): Promise<TherapeuticIndicationResponseDto> {
    this.logger.debug(`Creating indication for product ${dto.productId}`);

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found`);
    }

    // Verify species exists
    const species = await this.prisma.species.findUnique({
      where: { id: dto.speciesId },
    });
    if (!species) {
      throw new NotFoundException(`Species ${dto.speciesId} not found`);
    }

    // Verify route exists
    const route = await this.prisma.administrationRoute.findUnique({
      where: { id: dto.routeId },
    });
    if (!route) {
      throw new NotFoundException(`Route ${dto.routeId} not found`);
    }

    try {
      const indication = await this.prisma.therapeuticIndication.create({
        data: {
          ...(dto.id && { id: dto.id }),
          productId: dto.productId,
          countryCode: dto.countryCode,
          speciesId: dto.speciesId,
          ageCategoryId: dto.ageCategoryId,
          routeId: dto.routeId,
          doseMin: dto.doseMin,
          doseMax: dto.doseMax,
          doseUnitId: dto.doseUnitId,
          doseOriginalText: dto.doseOriginalText,
          protocolDurationDays: dto.protocolDurationDays,
          withdrawalMeatDays: dto.withdrawalMeatDays,
          withdrawalMilkDays: dto.withdrawalMilkDays,
          isVerified: dto.isVerified ?? false,
          validationNotes: dto.validationNotes,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('Therapeutic indication created', {
        indicationId: indication.id,
        productId: dto.productId,
        speciesId: dto.speciesId,
      });

      return indication;
    } catch (error) {
      this.logger.error(`Failed to create indication for product ${dto.productId}`, error.stack);
      throw error;
    }
  }

  async findAll(query: QueryTherapeuticIndicationDto): Promise<PaginatedResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TherapeuticIndicationWhereInput = {
      deletedAt: null,
    };

    if (query.productId) where.productId = query.productId;
    if (query.speciesId) where.speciesId = query.speciesId;
    if (query.countryCode) where.countryCode = query.countryCode;
    if (query.routeId) where.routeId = query.routeId;
    if (query.isVerified !== undefined) where.isVerified = query.isVerified;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [total, data] = await Promise.all([
      this.prisma.therapeuticIndication.count({ where }),
      this.prisma.therapeuticIndication.findMany({
        where,
        orderBy: [{ createdAt: Prisma.SortOrder.desc }],
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages },
    };
  }

  async findByProduct(productId: string): Promise<TherapeuticIndicationResponseDto[]> {
    return this.prisma.therapeuticIndication.findMany({
      where: {
        productId,
        deletedAt: null,
        isActive: true,
      },
      orderBy: [{ createdAt: Prisma.SortOrder.asc }],
    });
  }

  /**
   * Find the best matching indication for a treatment
   * Priority: country-specific > universal, age-specific > all ages
   */
  async findForTreatment(
    productId: string,
    speciesId: string,
    routeId: string,
    countryCode?: string,
    ageCategoryId?: string,
  ): Promise<TherapeuticIndicationResponseDto | null> {
    // Build priority-based query
    const indications = await this.prisma.therapeuticIndication.findMany({
      where: {
        productId,
        speciesId,
        routeId,
        deletedAt: null,
        isActive: true,
      },
      orderBy: { createdAt: Prisma.SortOrder.asc },
    });

    if (indications.length === 0) {
      return null;
    }

    // Priority matching
    // 1. Country + Age specific
    // 2. Country + All ages
    // 3. Universal + Age specific
    // 4. Universal + All ages
    let best = indications.find(
      (i) => i.countryCode === countryCode && i.ageCategoryId === ageCategoryId,
    );
    if (!best) {
      best = indications.find(
        (i) => i.countryCode === countryCode && !i.ageCategoryId,
      );
    }
    if (!best) {
      best = indications.find(
        (i) => !i.countryCode && i.ageCategoryId === ageCategoryId,
      );
    }
    if (!best) {
      best = indications.find((i) => !i.countryCode && !i.ageCategoryId);
    }
    if (!best) {
      best = indications[0]; // Fallback to first available
    }

    return best;
  }

  async findOne(id: string): Promise<TherapeuticIndicationResponseDto> {
    const indication = await this.prisma.therapeuticIndication.findFirst({
      where: { id, deletedAt: null },
    });

    if (!indication) {
      throw new NotFoundException(`Indication ${id} not found`);
    }

    return indication;
  }

  async update(id: string, dto: UpdateTherapeuticIndicationDto): Promise<TherapeuticIndicationResponseDto> {
    this.logger.debug(`Updating indication ${id}`);

    const existing = await this.prisma.therapeuticIndication.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Indication ${id} not found`);
    }

    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict');
    }

    try {
      const updated = await this.prisma.therapeuticIndication.update({
        where: { id },
        data: {
          doseMin: dto.doseMin !== undefined ? dto.doseMin : existing.doseMin,
          doseMax: dto.doseMax !== undefined ? dto.doseMax : existing.doseMax,
          doseUnitId: dto.doseUnitId !== undefined ? dto.doseUnitId : existing.doseUnitId,
          doseOriginalText: dto.doseOriginalText !== undefined ? dto.doseOriginalText : existing.doseOriginalText,
          protocolDurationDays: dto.protocolDurationDays !== undefined ? dto.protocolDurationDays : existing.protocolDurationDays,
          withdrawalMeatDays: dto.withdrawalMeatDays !== undefined ? dto.withdrawalMeatDays : existing.withdrawalMeatDays,
          withdrawalMilkDays: dto.withdrawalMilkDays !== undefined ? dto.withdrawalMilkDays : existing.withdrawalMilkDays,
          isVerified: dto.isVerified !== undefined ? dto.isVerified : existing.isVerified,
          validationNotes: dto.validationNotes !== undefined ? dto.validationNotes : existing.validationNotes,
          isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Therapeutic indication updated', { indicationId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update indication ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<TherapeuticIndicationResponseDto> {
    this.logger.debug(`Soft deleting indication ${id}`);

    const existing = await this.prisma.therapeuticIndication.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Indication ${id} not found`);
    }

    // Check dependencies before deleting
    const treatmentsCount = await this.prisma.treatment.count({
      where: { therapeuticIndicationId: id, deletedAt: null },
    });

    if (treatmentsCount > 0) {
      throw new ConflictException(
        `Cannot delete therapeutic indication: ${treatmentsCount} treatment(s) depend on it`,
      );
    }

    try {
      const deleted = await this.prisma.therapeuticIndication.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Therapeutic indication soft deleted', { indicationId: id });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete indication ${id}`, error.stack);
      throw error;
    }
  }

  async restore(id: string): Promise<TherapeuticIndicationResponseDto> {
    this.logger.debug(`Restoring indication ${id}`);

    const existing = await this.prisma.therapeuticIndication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Indication ${id} not found`);
    }

    if (!existing.deletedAt) {
      throw new ConflictException('Indication is not deleted');
    }

    const restored = await this.prisma.therapeuticIndication.update({
      where: { id },
      data: {
        deletedAt: null,
        version: existing.version + 1,
      },
    });

    this.logger.audit('Therapeutic indication restored', { indicationId: id });
    return restored;
  }

  /**
   * Calculate withdrawal end date
   */
  calculateWithdrawalDate(treatmentDate: Date, withdrawalDays: number): Date {
    const endDate = new Date(treatmentDate);
    endDate.setDate(endDate.getDate() + withdrawalDays);
    return endDate;
  }
}
