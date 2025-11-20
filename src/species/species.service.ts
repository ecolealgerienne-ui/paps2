import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service for managing species reference data
 * Based on BACKEND_DELTA.md section 5.1
 */
@Injectable()
export class SpeciesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all species ordered by displayOrder
   * Used for UI dropdowns
   * @returns All active species with i18n fields
   */
  async findAll() {
    return this.prisma.species.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        nameAr: true,
        icon: true,
        displayOrder: true,
      },
    });
  }
}
