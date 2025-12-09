import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportDataQueryDto, ReportDataType } from './dto';
import { AppLogger } from '../common/utils/logger.service';

const EXPORT_LIMIT = 10000;

@Injectable()
export class ReportsService {
  private readonly logger = new AppLogger(ReportsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get report data for export (no pagination, high limit)
   */
  async getReportData(farmId: string, query: ReportDataQueryDto) {
    const type = query.type || ReportDataType.HERD_INVENTORY;
    this.logger.debug(`Generating report data: ${type} for farm ${farmId}`);

    switch (type) {
      case ReportDataType.HERD_INVENTORY:
        return this.getHerdInventoryData(farmId, query);
      case ReportDataType.TREATMENTS:
        return this.getTreatmentsData(farmId, query, 'treatment');
      case ReportDataType.VACCINATIONS:
        return this.getTreatmentsData(farmId, query, 'vaccination');
      case ReportDataType.GROWTH:
        return this.getGrowthData(farmId, query);
      case ReportDataType.MOVEMENTS:
        return this.getMovementsData(farmId, query);
      default:
        return this.getHerdInventoryData(farmId, query);
    }
  }

  /**
   * Herd Inventory Report Data
   */
  private async getHerdInventoryData(farmId: string, query: ReportDataQueryDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    // Filter by animal status
    if (query.animalStatus && query.animalStatus !== 'all') {
      where.status = query.animalStatus;
    }

    // Filter by species
    if (query.speciesId) {
      where.breed = { speciesId: query.speciesId };
    }

    // Filter by lots
    if (query.lotIds?.length) {
      where.lotAnimals = {
        some: {
          lotId: { in: query.lotIds },
          leftAt: null,
        },
      };
    }

    const [animals, total] = await Promise.all([
      this.prisma.animal.findMany({
        where,
        take: EXPORT_LIMIT,
        include: {
          breed: {
            include: { species: { select: { id: true, nameFr: true, nameEn: true } } },
          },
          lotAnimals: {
            where: { leftAt: null },
            include: { lot: { select: { id: true, name: true } } },
            take: 1,
          },
          weights: {
            orderBy: { weightDate: 'desc' },
            take: 1,
            select: { weight: true, weightDate: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.animal.count({ where }),
    ]);

    // Calculate summary
    const summary = {
      totalAnimals: total,
      byStatus: {} as Record<string, number>,
      bySex: { male: 0, female: 0 },
      bySpecies: [] as Array<{ speciesId: string; name: string; count: number }>,
    };

    const speciesMap = new Map<string, { name: string; count: number }>();

    animals.forEach(animal => {
      // By status
      summary.byStatus[animal.status] = (summary.byStatus[animal.status] || 0) + 1;

      // By sex
      if (animal.sex === 'male') summary.bySex.male++;
      else if (animal.sex === 'female') summary.bySex.female++;

      // By species
      const speciesId = animal.breed?.speciesId;
      const speciesName = animal.breed?.species?.nameFr || 'Unknown';
      if (speciesId) {
        if (!speciesMap.has(speciesId)) {
          speciesMap.set(speciesId, { name: speciesName, count: 0 });
        }
        speciesMap.get(speciesId)!.count++;
      }
    });

    summary.bySpecies = Array.from(speciesMap.entries()).map(([speciesId, data]) => ({
      speciesId,
      name: data.name,
      count: data.count,
    }));

    // Format details
    const details = animals.map(animal => ({
      animalId: animal.id,
      visualId: animal.visualId,
      officialNumber: animal.officialNumber,
      species: animal.breed?.species?.nameFr || '',
      breed: animal.breed?.nameFr || '',
      sex: animal.sex,
      birthDate: animal.birthDate?.toISOString().split('T')[0] || null,
      age: animal.birthDate ? this.calculateAge(animal.birthDate) : null,
      status: animal.status,
      lotName: animal.lotAnimals[0]?.lot?.name || null,
      currentWeight: animal.weights[0]?.weight || null,
      lastWeighingDate: animal.weights[0]?.weightDate?.toISOString().split('T')[0] || null,
    }));

    return {
      success: true,
      data: {
        type: ReportDataType.HERD_INVENTORY,
        generatedAt: new Date().toISOString(),
        period: {
          from: query.fromDate || null,
          to: query.toDate || null,
        },
        summary,
        details,
      },
      meta: {
        total,
        exported: details.length,
        limit: EXPORT_LIMIT,
      },
    };
  }

  /**
   * Treatments/Vaccinations Report Data
   */
  private async getTreatmentsData(
    farmId: string,
    query: ReportDataQueryDto,
    treatmentType: 'treatment' | 'vaccination',
  ) {
    const where: any = {
      farmId,
      deletedAt: null,
      type: treatmentType,
    };

    // Filter by dates
    if (query.fromDate || query.toDate) {
      where.treatmentDate = {};
      if (query.fromDate) where.treatmentDate.gte = new Date(query.fromDate);
      if (query.toDate) where.treatmentDate.lte = new Date(query.toDate);
    }

    // Filter by animal status
    if (query.animalStatus && query.animalStatus !== 'all') {
      where.animal = { status: query.animalStatus };
    }

    // Filter by lots
    if (query.lotIds?.length) {
      where.lotId = { in: query.lotIds };
    }

    const [treatments, total] = await Promise.all([
      this.prisma.treatment.findMany({
        where,
        take: EXPORT_LIMIT,
        include: {
          animal: { select: { id: true, visualId: true, officialNumber: true } },
          product: { select: { id: true, nameFr: true } },
          veterinarian: { select: { id: true, firstName: true, lastName: true } },
          lot: { select: { id: true, name: true } },
          farmerLot: { select: { officialLotNumber: true } },
        },
        orderBy: { treatmentDate: 'desc' },
      }),
      this.prisma.treatment.count({ where }),
    ]);

    // Calculate summary
    const productMap = new Map<string, number>();
    const animalSet = new Set<string>();

    treatments.forEach(t => {
      animalSet.add(t.animalId);
      const productName = t.product?.nameFr || t.productName || 'Unknown';
      productMap.set(productName, (productMap.get(productName) || 0) + 1);
    });

    const summary = {
      totalTreatments: total,
      animalsTreated: animalSet.size,
      byProduct: Array.from(productMap.entries())
        .map(([product, count]) => ({ product, count }))
        .sort((a, b) => b.count - a.count),
    };

    // Format details
    const details = treatments.map(t => ({
      date: t.treatmentDate.toISOString().split('T')[0],
      animalId: t.animalId,
      visualId: t.animal?.visualId || '',
      officialNumber: t.animal?.officialNumber || null,
      productName: t.product?.nameFr || t.productName,
      dose: t.dose,
      dosageUnit: t.dosageUnit,
      batchNumber: t.farmerLot?.officialLotNumber || null,
      veterinarian: t.veterinarian
        ? `${t.veterinarian.firstName} ${t.veterinarian.lastName}`
        : t.veterinarianName || null,
      lotName: t.lot?.name || null,
      nextDueDate: t.nextDueDate?.toISOString().split('T')[0] || null,
      notes: t.notes,
    }));

    // Get upcoming (for vaccinations)
    let upcoming: any[] = [];
    if (treatmentType === 'vaccination') {
      const upcomingVaccinations = await this.prisma.treatment.findMany({
        where: {
          farmId,
          deletedAt: null,
          type: 'vaccination',
          nextDueDate: { gte: new Date() },
          animal: query.animalStatus && query.animalStatus !== 'all'
            ? { status: query.animalStatus, deletedAt: null }
            : { deletedAt: null },
        },
        include: {
          animal: { select: { id: true, visualId: true } },
          product: { select: { nameFr: true } },
        },
        orderBy: { nextDueDate: 'asc' },
        take: 100,
      });

      upcoming = upcomingVaccinations.map(v => ({
        animalId: v.animalId,
        visualId: v.animal?.visualId || '',
        productName: v.product?.nameFr || v.productName,
        dueDate: v.nextDueDate?.toISOString().split('T')[0],
      }));
    }

    return {
      success: true,
      data: {
        type: treatmentType === 'vaccination' ? ReportDataType.VACCINATIONS : ReportDataType.TREATMENTS,
        generatedAt: new Date().toISOString(),
        period: {
          from: query.fromDate || null,
          to: query.toDate || null,
        },
        summary,
        details,
        ...(treatmentType === 'vaccination' && { upcoming }),
      },
      meta: {
        total,
        exported: details.length,
        limit: EXPORT_LIMIT,
      },
    };
  }

  /**
   * Growth Report Data
   */
  private async getGrowthData(farmId: string, query: ReportDataQueryDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    // Filter by dates
    if (query.fromDate || query.toDate) {
      where.weightDate = {};
      if (query.fromDate) where.weightDate.gte = new Date(query.fromDate);
      if (query.toDate) where.weightDate.lte = new Date(query.toDate);
    }

    // Filter by animal status
    if (query.animalStatus && query.animalStatus !== 'all') {
      where.animal = { status: query.animalStatus };
    }

    const [weights, total] = await Promise.all([
      this.prisma.weight.findMany({
        where,
        take: EXPORT_LIMIT,
        include: {
          animal: {
            select: {
              id: true,
              visualId: true,
              officialNumber: true,
              lotAnimals: {
                where: { leftAt: null },
                include: { lot: { select: { id: true, name: true } } },
                take: 1,
              },
            },
          },
        },
        orderBy: { weightDate: 'asc' },
      }),
      this.prisma.weight.count({ where }),
    ]);

    // Group by animal for ADG calculation
    const animalWeights = new Map<string, {
      animal: any;
      weights: { weight: number; date: Date }[];
    }>();

    weights.forEach(w => {
      if (!animalWeights.has(w.animalId)) {
        animalWeights.set(w.animalId, {
          animal: w.animal,
          weights: [],
        });
      }
      animalWeights.get(w.animalId)!.weights.push({
        weight: w.weight,
        date: w.weightDate,
      });
    });

    // Calculate ADG for each animal
    const animalStats: Array<{
      animalId: string;
      visualId: string;
      lotId: string | null;
      lotName: string | null;
      avgDailyGain: number;
      weightGain: number;
      currentWeight: number;
      weighingsCount: number;
    }> = [];

    animalWeights.forEach((data, animalId) => {
      if (data.weights.length >= 2) {
        const sorted = data.weights.sort((a, b) => a.date.getTime() - b.date.getTime());
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const daysDiff = Math.ceil((last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff > 0) {
          const adg = (last.weight - first.weight) / daysDiff;
          animalStats.push({
            animalId,
            visualId: data.animal?.visualId || '',
            lotId: data.animal?.lotAnimals[0]?.lot?.id || null,
            lotName: data.animal?.lotAnimals[0]?.lot?.name || null,
            avgDailyGain: Math.round(adg * 1000) / 1000,
            weightGain: Math.round((last.weight - first.weight) * 10) / 10,
            currentWeight: Math.round(last.weight * 10) / 10,
            weighingsCount: data.weights.length,
          });
        }
      }
    });

    // Summary
    const allWeightValues = weights.map(w => w.weight);
    const adgValues = animalStats.map(a => a.avgDailyGain);

    const summary = {
      totalWeighings: total,
      animalsWeighed: animalWeights.size,
      avgDailyGain: adgValues.length > 0
        ? Math.round((adgValues.reduce((a, b) => a + b, 0) / adgValues.length) * 1000) / 1000
        : 0,
      avgWeight: allWeightValues.length > 0
        ? Math.round((allWeightValues.reduce((a, b) => a + b, 0) / allWeightValues.length) * 10) / 10
        : 0,
      minWeight: allWeightValues.length > 0 ? Math.min(...allWeightValues) : 0,
      maxWeight: allWeightValues.length > 0 ? Math.max(...allWeightValues) : 0,
    };

    // By lot
    const lotMap = new Map<string, {
      lotId: string;
      lotName: string;
      animals: typeof animalStats;
    }>();

    animalStats.forEach(a => {
      const lotId = a.lotId || 'no-lot';
      const lotName = a.lotName || 'Sans lot';
      if (!lotMap.has(lotId)) {
        lotMap.set(lotId, { lotId, lotName, animals: [] });
      }
      lotMap.get(lotId)!.animals.push(a);
    });

    const byLot = Array.from(lotMap.values()).map(lot => {
      const avgAdg = lot.animals.reduce((sum, a) => sum + a.avgDailyGain, 0) / lot.animals.length;
      const avgWeight = lot.animals.reduce((sum, a) => sum + a.currentWeight, 0) / lot.animals.length;
      return {
        lotId: lot.lotId === 'no-lot' ? null : lot.lotId,
        lotName: lot.lotName,
        animalCount: lot.animals.length,
        avgDailyGain: Math.round(avgAdg * 1000) / 1000,
        avgWeight: Math.round(avgWeight * 10) / 10,
        gmqStatus: this.getGmqStatus(avgAdg),
      };
    });

    // Top and low performers
    const sortedByAdg = [...animalStats].sort((a, b) => b.avgDailyGain - a.avgDailyGain);
    const topPerformers = sortedByAdg.slice(0, 10);
    const lowPerformers = sortedByAdg.slice(-10).reverse().map(a => ({
      ...a,
      alert: a.avgDailyGain < 0.5 ? 'GMQ critique' : a.avgDailyGain < 0.6 ? 'GMQ faible' : undefined,
    }));

    return {
      success: true,
      data: {
        type: ReportDataType.GROWTH,
        generatedAt: new Date().toISOString(),
        period: {
          from: query.fromDate || null,
          to: query.toDate || null,
        },
        summary,
        byLot,
        topPerformers,
        lowPerformers,
      },
      meta: {
        total,
        exported: weights.length,
        limit: EXPORT_LIMIT,
      },
    };
  }

  /**
   * Movements Report Data
   */
  private async getMovementsData(farmId: string, query: ReportDataQueryDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    // Filter by dates
    if (query.fromDate || query.toDate) {
      where.movementDate = {};
      if (query.fromDate) where.movementDate.gte = new Date(query.fromDate);
      if (query.toDate) where.movementDate.lte = new Date(query.toDate);
    }

    // Filter by animal status
    if (query.animalStatus && query.animalStatus !== 'all') {
      where.animal = { status: query.animalStatus };
    }

    const [movements, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        take: EXPORT_LIMIT,
        include: {
          animal: { select: { id: true, visualId: true, officialNumber: true } },
          fromFarm: { select: { id: true, name: true } },
          toFarm: { select: { id: true, name: true } },
          buyer: { select: { id: true, name: true } },
        },
        orderBy: { movementDate: 'desc' },
      }),
      this.prisma.movement.count({ where }),
    ]);

    // Summary by type
    const byType: Record<string, number> = {};
    movements.forEach(m => {
      byType[m.type] = (byType[m.type] || 0) + 1;
    });

    const summary = {
      totalMovements: total,
      byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    };

    // Format details
    const details = movements.map(m => ({
      date: m.movementDate.toISOString().split('T')[0],
      type: m.type,
      animalId: m.animalId,
      visualId: m.animal?.visualId || '',
      officialNumber: m.animal?.officialNumber || null,
      fromFarm: m.fromFarm?.name || null,
      toFarm: m.toFarm?.name || null,
      buyer: m.buyer?.name || null,
      reason: m.reason,
      notes: m.notes,
    }));

    return {
      success: true,
      data: {
        type: ReportDataType.MOVEMENTS,
        generatedAt: new Date().toISOString(),
        period: {
          from: query.fromDate || null,
          to: query.toDate || null,
        },
        summary,
        details,
      },
      meta: {
        total,
        exported: details.length,
        limit: EXPORT_LIMIT,
      },
    };
  }

  /**
   * Calculate age string from birth date
   */
  private calculateAge(birthDate: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays}j`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}m`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 ? `${years}a ${remainingMonths}m` : `${years}a`;
    }
  }

  /**
   * Get GMQ status based on ADG value
   */
  private getGmqStatus(adg: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (adg >= 1.0) return 'excellent';
    if (adg >= 0.8) return 'good';
    if (adg >= 0.6) return 'warning';
    return 'critical';
  }
}
