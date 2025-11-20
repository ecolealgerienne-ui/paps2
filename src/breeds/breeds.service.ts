import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service for managing breeds reference data
 * Based on BACKEND_DELTA.md section 5.2
 */
@Injectable()
export class BreedsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all breeds, optionally filtered by speciesId
   * Ordered by displayOrder
   * Used for UI dropdowns
   * @param speciesId - Optional filter by species ID
   * @returns All active breeds with i18n fields
   */
  async findAll(speciesId?: string) {
    const where: any = {
      isActive: true,
    };

    if (speciesId) {
      where.speciesId = speciesId;
    }

    return this.prisma.breed.findMany({
      where,
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        id: true,
        speciesId: true,
        nameFr: true,
        nameEn: true,
        nameAr: true,
        description: true,
        displayOrder: true,
        isActive: true,
      },
    });
  }
}
