import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto, QueryProductCategoryDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class ProductCategoriesService {
  private readonly logger = new AppLogger(ProductCategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductCategoryDto) {
    this.logger.debug(`Creating product category with code ${dto.code}`);

    const existing = await this.prisma.productCategory.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Product category with code ${dto.code} already exists`);
    }

    try {
      const category = await this.prisma.productCategory.create({
        data: {
          ...(dto.id && { id: dto.id }),
          code: dto.code,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn ?? dto.nameFr,
          nameAr: dto.nameAr ?? dto.nameFr,
          description: dto.description,
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
        },
      });

      this.logger.audit('Product category created', { categoryId: category.id, code: dto.code });
      return category;
    } catch (error) {
      this.logger.error(`Failed to create product category ${dto.code}`, error.stack);
      throw error;
    }
  }

  async findAll(query: QueryProductCategoryDto) {
    const where: any = {
      deletedAt: null,
    };

    if (query.isActive !== undefined) where.isActive = query.isActive;

    return this.prisma.productCategory.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { nameFr: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(`Product category ${id} not found`);
    }

    return category;
  }

  async findByCode(code: string) {
    const category = await this.prisma.productCategory.findFirst({
      where: { code, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(`Product category with code ${code} not found`);
    }

    return category;
  }

  async update(id: string, dto: UpdateProductCategoryDto) {
    this.logger.debug(`Updating product category ${id}`);

    const existing = await this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Product category ${id} not found`);
    }

    if (dto.version !== undefined && existing.version !== dto.version) {
      throw new ConflictException('Version conflict');
    }

    try {
      const { version, ...updateData } = dto;

      const updated = await this.prisma.productCategory.update({
        where: { id },
        data: {
          ...updateData,
          version: existing.version + 1,
        },
      });

      this.logger.audit('Product category updated', { categoryId: id });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update product category ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.debug(`Soft deleting product category ${id}`);

    const existing = await this.prisma.productCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Product category ${id} not found`);
    }

    try {
      const deleted = await this.prisma.productCategory.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Product category soft deleted', { categoryId: id });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete product category ${id}`, error.stack);
      throw error;
    }
  }
}
