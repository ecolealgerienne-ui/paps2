import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductCountryDto, UpdateProductCountryDto } from './dto';

@Injectable()
export class ProductCountriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductCountryDto) {
    // Vérifier que le produit existe
    const product = await this.prisma.globalMedicalProduct.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${dto.productId}" not found`);
    }

    // Vérifier que le pays existe
    const country = await this.prisma.country.findUnique({
      where: { code: dto.countryCode.toUpperCase() },
    });

    if (!country) {
      throw new NotFoundException(`Country with code "${dto.countryCode}" not found`);
    }

    // Vérifier l'unicité
    const existing = await this.prisma.productCountry.findFirst({
      where: {
        productId: dto.productId,
        countryCode: dto.countryCode.toUpperCase(),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Product ${product.code} is already associated with country ${dto.countryCode}`
      );
    }

    return this.prisma.productCountry.create({
      data: {
        ...dto,
        countryCode: dto.countryCode.toUpperCase(),
      },
      include: {
        product: true,
        country: true,
      },
    });
  }

  async findAll() {
    return this.prisma.productCountry.findMany({
      include: {
        product: true,
        country: true,
      },
      orderBy: [
        { product: { code: 'asc' } },
        { country: { code: 'asc' } },
      ],
    });
  }

  /**
   * Liste des pays d'un produit (PHASE_17 requirement)
   */
  async findCountriesByProduct(productId: string) {
    const product = await this.prisma.globalMedicalProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    return this.prisma.productCountry.findMany({
      where: { productId },
      include: {
        country: true,
      },
      orderBy: {
        country: { nameFr: 'asc' },
      },
    });
  }

  /**
   * Liste des produits d'un pays (PHASE_17 requirement)
   */
  async findProductsByCountry(countryCode: string) {
    const country = await this.prisma.country.findUnique({
      where: { code: countryCode.toUpperCase() },
    });

    if (!country) {
      throw new NotFoundException(`Country with code "${countryCode}" not found`);
    }

    return this.prisma.productCountry.findMany({
      where: { countryCode: countryCode.toUpperCase() },
      include: {
        product: true,
      },
      orderBy: {
        product: { code: 'asc' },
      },
    });
  }

  async findOne(id: string) {
    const productCountry = await this.prisma.productCountry.findUnique({
      where: { id },
      include: {
        product: true,
        country: true,
      },
    });

    if (!productCountry) {
      throw new NotFoundException(`ProductCountry with ID "${id}" not found`);
    }

    return productCountry;
  }

  async update(id: string, dto: UpdateProductCountryDto) {
    await this.findOne(id);

    return this.prisma.productCountry.update({
      where: { id },
      data: dto,
      include: {
        product: true,
        country: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.productCountry.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, isActive: boolean) {
    await this.findOne(id);

    return this.prisma.productCountry.update({
      where: { id },
      data: { isActive },
      include: {
        product: true,
        country: true,
      },
    });
  }
}
