import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto, UpdateCountryDto } from './dto';

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCountryDto) {
    // Vérifier code unique
    const existing = await this.prisma.country.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Country with code "${dto.code}" already exists`);
    }

    return this.prisma.country.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(), // Forcer majuscules
      },
    });
  }

  async findAll(region?: string, includeInactive = false) {
    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (region) {
      where.region = region;
    }

    return this.prisma.country.findMany({
      where,
      orderBy: [
        { region: 'asc' },
        { nameFr: 'asc' },
      ],
    });
  }

  async findByRegion(region: string) {
    return this.prisma.country.findMany({
      where: { region, isActive: true },
      orderBy: { nameFr: 'asc' },
    });
  }

  async findOne(code: string) {
    const country = await this.prisma.country.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!country) {
      throw new NotFoundException(`Country with code "${code}" not found`);
    }

    return country;
  }

  async update(code: string, dto: UpdateCountryDto) {
    await this.findOne(code);

    return this.prisma.country.update({
      where: { code: code.toUpperCase() },
      data: dto,
    });
  }

  async toggleActive(code: string, isActive: boolean) {
    await this.findOne(code);

    return this.prisma.country.update({
      where: { code: code.toUpperCase() },
      data: { isActive },
    });
  }

  async remove(code: string) {
    const country = await this.findOne(code);

    // Vérifier utilisation dans les tables de liaison
    const usageCount = await this.checkUsage(code);

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete country "${code}": used in ${usageCount} product/breed/vaccine/campaign liaisons. Deactivate instead.`
      );
    }

    return this.prisma.country.delete({
      where: { code: code.toUpperCase() },
    });
  }

  private async checkUsage(code: string): Promise<number> {
    // Pour l'instant, seul ProductCountry existe
    const products = await this.prisma.productCountry.count({
      where: { countryCode: code }
    });

    // TODO: Ajouter les autres compteurs quand les phases seront implémentées
    // const breeds = await this.prisma.breedCountry.count({ where: { countryCode: code } });
    // const vaccines = await this.prisma.vaccineCountry.count({ where: { countryCode: code } });
    // const campaigns = await this.prisma.campaignCountry.count({ where: { countryCode: code } });

    return products;
  }

  /**
   * Retourner régions disponibles
   */
  async getRegions() {
    const regions = await this.prisma.country.findMany({
      where: { isActive: true },
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    });

    return regions.map(r => r.region).filter(r => r !== null);
  }
}
