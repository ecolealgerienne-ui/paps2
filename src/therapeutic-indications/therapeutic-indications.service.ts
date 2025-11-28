import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTherapeuticIndicationDto, UpdateTherapeuticIndicationDto, QueryTherapeuticIndicationDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

/**
 * Service for managing Therapeutic Indications
 * Contains withdrawal times and dosage information per product/species/route
 */
@Injectable()
export class TherapeuticIndicationsService {
  private readonly logger = new AppLogger(TherapeuticIndicationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTherapeuticIndicationDto) {
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
        include: {
          product: { select: { id: true, nameFr: true, type: true } },
          species: true,
          ageCategory: true,
          route: true,
          doseUnit: true,
          country: true,
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

  async findAll(query: QueryTherapeuticIndicationDto) {
    const where: any = {
      deletedAt: null,
    };

    if (query.productId) where.productId = query.productId;
    if (query.speciesId) where.speciesId = query.speciesId;
    if (query.countryCode) where.countryCode = query.countryCode;
    if (query.routeId) where.routeId = query.routeId;
    if (query.isVerified !== undefined) where.isVerified = query.isVerified;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    return this.prisma.therapeuticIndication.findMany({
      where,
      include: {
        product: { select: { id: true, nameFr: true, type: true, manufacturer: true } },
        species: true,
        ageCategory: true,
        route: true,
        doseUnit: true,
        country: true,
      },
      orderBy: [
        { product: { nameFr: 'asc' } },
        { species: { displayOrder: 'asc' } },
      ],
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.therapeuticIndication.findMany({
      where: {
        productId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        species: true,
        ageCategory: true,
        route: true,
        doseUnit: true,
        country: true,
      },
      orderBy: [
        { species: { displayOrder: 'asc' } },
        { route: { displayOrder: 'asc' } },
      ],
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
  ) {
    // Build priority-based query
    const indications = await this.prisma.therapeuticIndication.findMany({
      where: {
        productId,
        speciesId,
        routeId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        species: true,
        ageCategory: true,
        route: true,
        doseUnit: true,
      },
      orderBy: { createdAt: 'asc' },
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

  async findOne(id: string) {
    const indication = await this.prisma.therapeuticIndication.findFirst({
      where: { id, deletedAt: null },
      include: {
        product: true,
        species: true,
        ageCategory: true,
        route: true,
        doseUnit: true,
        country: true,
      },
    });

    if (!indication) {
      throw new NotFoundException(`Indication ${id} not found`);
    }

    return indication;
  }

  async update(id: string, dto: UpdateTherapeuticIndicationDto) {
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
      const { version, ...updateData } = dto;

      const updated = await this.prisma.therapeuticIndication.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
        include: {
          product: { select: { id: true, nameFr: true, type: true } },
          species: true,
          ageCategory: true,
          route: true,
          doseUnit: true,
          country: true,
        },
      });

      this.logger.audit('Therapeutic indication updated', { indicationId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update indication ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.debug(`Soft deleting indication ${id}`);

    const existing = await this.prisma.therapeuticIndication.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Indication ${id} not found`);
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

  /**
   * Calculate withdrawal end date
   */
  calculateWithdrawalDate(treatmentDate: Date, withdrawalDays: number): Date {
    const endDate = new Date(treatmentDate);
    endDate.setDate(endDate.getDate() + withdrawalDays);
    return endDate;
  }
}
