import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalProductDto, UpdateMedicalProductDto, QueryMedicalProductDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import { EntityNotFoundException } from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class MedicalProductsService {
  private readonly logger = new AppLogger(MedicalProductsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateMedicalProductDto) {
    this.logger.debug(`Creating medical product in farm ${farmId}`);

    try {
      const product = await this.prisma.customMedicalProduct.create({
        data: {
          ...dto,
          farmId,
        },
      });

      this.logger.audit('Medical product created', { medicalProductId: product.id, farmId });
      return product;
    } catch (error) {
      this.logger.error(`Failed to create medical product in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryMedicalProductDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.prisma.customMedicalProduct.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const product = await this.prisma.customMedicalProduct.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!product) {
      this.logger.warn('Medical product not found', { medicalProductId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MEDICAL_PRODUCT_NOT_FOUND,
        `Medical product ${id} not found`,
        { medicalProductId: id, farmId },
      );
    }

    return product;
  }

  async update(farmId: string, id: string, dto: UpdateMedicalProductDto) {
    this.logger.debug(`Updating medical product ${id}`);

    const existing = await this.prisma.customMedicalProduct.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Medical product not found', { medicalProductId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MEDICAL_PRODUCT_NOT_FOUND,
        `Medical product ${id} not found`,
        { medicalProductId: id, farmId },
      );
    }

    try {
      const updated = await this.prisma.customMedicalProduct.update({
        where: { id },
        data: {
          ...dto,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Medical product updated', { medicalProductId: id, farmId });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update medical product ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting medical product ${id}`);

    const existing = await this.prisma.customMedicalProduct.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Medical product not found', { medicalProductId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.MEDICAL_PRODUCT_NOT_FOUND,
        `Medical product ${id} not found`,
        { medicalProductId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.customMedicalProduct.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Medical product soft deleted', { medicalProductId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete medical product ${id}`, error.stack);
      throw error;
    }
  }
}
