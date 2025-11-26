import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MedicalProductType } from './types/medical-product-type.enum';
import { CreateGlobalMedicalProductDto } from './dto/create-global-medical-product.dto';
import { UpdateGlobalMedicalProductDto } from './dto/update-global-medical-product.dto';
import { DataScope } from '@prisma/client';

@Injectable()
export class GlobalMedicalProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGlobalMedicalProductDto) {
    // Vérifier code unique parmi les produits globaux
    const existing = await this.prisma.medicalProduct.findFirst({
      where: {
        code: dto.code,
        scope: DataScope.global,
      },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Product with code "${dto.code}" already exists`);
    }

    // Si soft-deleted, restaurer
    if (existing && existing.deletedAt) {
      return this.prisma.medicalProduct.update({
        where: { id: existing.id },
        data: {
          ...dto,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
    }

    return this.prisma.medicalProduct.create({
      data: {
        ...dto,
        scope: DataScope.global,
        farmId: null, // Global products have no farm
      },
    });
  }

  async findAll(filters?: { type?: MedicalProductType; laboratoire?: string; includeDeleted?: boolean }) {
    const where: any = {
      scope: DataScope.global, // Only return global products
    };

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

    return this.prisma.medicalProduct.findMany({
      where,
      orderBy: { nameFr: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.medicalProduct.findFirst({
      where: {
        id,
        scope: DataScope.global,
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Global medical product with id "${id}" not found`);
    }

    return product;
  }

  async findByCode(code: string) {
    const product = await this.prisma.medicalProduct.findFirst({
      where: {
        code,
        scope: DataScope.global,
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Global medical product with code "${code}" not found`);
    }

    return product;
  }

  async findByType(type: MedicalProductType) {
    return this.prisma.medicalProduct.findMany({
      where: {
        type,
        scope: DataScope.global,
        deletedAt: null,
      },
      orderBy: { nameFr: 'asc' },
    });
  }

  async update(id: string, dto: UpdateGlobalMedicalProductDto) {
    const existing = await this.findOne(id);

    // Optimistic locking
    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict: the resource has been modified by another user');
    }

    return this.prisma.medicalProduct.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);

    return this.prisma.medicalProduct.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  async restore(id: string) {
    const product = await this.prisma.medicalProduct.findFirst({
      where: {
        id,
        scope: DataScope.global,
      },
    });

    if (!product) {
      throw new NotFoundException('Global medical product not found');
    }

    if (!product.deletedAt) {
      throw new ConflictException('Global medical product is not deleted');
    }

    return this.prisma.medicalProduct.update({
      where: { id },
      data: {
        deletedAt: null,
        version: product.version + 1,
      },
    });
  }
}
