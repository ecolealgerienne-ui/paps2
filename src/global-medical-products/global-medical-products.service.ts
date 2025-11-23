import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MedicalProductType } from './types/medical-product-type.enum';
import { CreateGlobalMedicalProductDto } from './dto/create-global-medical-product.dto';
import { UpdateGlobalMedicalProductDto } from './dto/update-global-medical-product.dto';

@Injectable()
export class GlobalMedicalProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGlobalMedicalProductDto) {
    // Vérifier code unique
    const existing = await this.prisma.globalMedicalProduct.findUnique({
      where: { code: dto.code },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Product with code "${dto.code}" already exists`);
    }

    // Si soft-deleted, restaurer
    if (existing && existing.deletedAt) {
      return this.prisma.globalMedicalProduct.update({
        where: { id: existing.id },
        data: {
          ...dto,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
    }

    return this.prisma.globalMedicalProduct.create({ data: dto });
  }

  async findAll(filters?: { type?: MedicalProductType; laboratoire?: string; includeDeleted?: boolean }) {
    const where: any = {};

    // Filtre soft delete
    if (!filters?.includeDeleted) {
      where.deletedAt = null;
    }

    // Filtre par type
    if (filters?.type) {
      where.type = filters.type;
    }

    // Filtre par laboratoire (recherche insensible à la casse)
    if (filters?.laboratoire) {
      where.laboratoire = {
        contains: filters.laboratoire,
        mode: 'insensitive',
      };
    }

    return this.prisma.globalMedicalProduct.findMany({
      where,
      orderBy: { nameFr: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.globalMedicalProduct.findUnique({
      where: { id },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Global medical product with id "${id}" not found`);
    }

    return product;
  }

  async findByCode(code: string) {
    const product = await this.prisma.globalMedicalProduct.findUnique({
      where: { code },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Global medical product with code "${code}" not found`);
    }

    return product;
  }

  async findByType(type: MedicalProductType) {
    return this.prisma.globalMedicalProduct.findMany({
      where: { type, deletedAt: null },
      orderBy: { nameFr: 'asc' },
    });
  }

  async update(id: string, dto: UpdateGlobalMedicalProductDto) {
    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the resource has been modified by another user');
    }

    return this.prisma.globalMedicalProduct.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    // Note: Vérification d'utilisation dans FarmProductPreference sera ajoutée en Phase 21
    // Pour l'instant, on permet la suppression
    // const usageCount = await this.prisma.farmProductPreference.count({
    //   where: { globalProductId: id },
    // });
    // if (usageCount > 0) {
    //   throw new ConflictException(`Product used in ${usageCount} farm preferences`);
    // }

    return this.prisma.globalMedicalProduct.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  async restore(id: string) {
    const product = await this.prisma.globalMedicalProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Global medical product not found');
    }

    if (!product.deletedAt) {
      throw new ConflictException('Global medical product is not deleted');
    }

    return this.prisma.globalMedicalProduct.update({
      where: { id },
      data: {
        deletedAt: null,
        version: product.version + 1,
      },
    });
  }
}
