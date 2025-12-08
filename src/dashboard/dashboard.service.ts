import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionsQueryDto, DashboardStatsQueryDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';

@Injectable()
export class DashboardService {
  private readonly logger = new AppLogger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get unified action center with all required tasks
   * Endpoint: GET /api/v1/farms/:farmId/dashboard/actions
   */
  async getActions(farmId: string, query: ActionsQueryDto) {
    this.logger.debug(`Getting dashboard actions for farm ${farmId}`);

    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const actions: {
      id: string;
      type: string;
      priority: 'critical' | 'high' | 'medium' | 'low' | 'success';
      category: 'urgent' | 'this_week' | 'planned' | 'opportunities';
      title: string;
      description: string;
      affectedCount: number;
      dueDate?: Date;
      url?: string;
    }[] = [];

    // 1. URGENT: Withdrawal periods expiring soon (within 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringWithdrawals = await this.prisma.lot.findMany({
      where: {
        farmId,
        deletedAt: null,
        withdrawalEndDate: {
          gte: now,
          lte: threeDaysFromNow,
        },
        completed: false,
      },
      include: {
        _count: { select: { lotAnimals: { where: { leftAt: null } } } },
      },
    });

    expiringWithdrawals.forEach(lot => {
      actions.push({
        id: `withdrawal_${lot.id}`,
        type: 'withdrawal_expiring',
        priority: 'critical',
        category: 'urgent',
        title: `Délai d'attente expire bientôt`,
        description: `Lot "${lot.name}" - ${lot._count.lotAnimals} animaux`,
        affectedCount: lot._count.lotAnimals,
        dueDate: lot.withdrawalEndDate!,
        url: `/lots/${lot.id}`,
      });
    });

    // 2. URGENT: Overdue treatments (treatments that should have been done)
    const overdueTreatments = await this.prisma.treatment.findMany({
      where: {
        farmId,
        deletedAt: null,
        nextDueDate: { lt: now },
        status: { not: 'completed' },
      },
      include: {
        animal: { select: { id: true, visualId: true, officialNumber: true } },
      },
      take: 10,
    });

    if (overdueTreatments.length > 0) {
      actions.push({
        id: 'treatments_overdue',
        type: 'treatment_overdue',
        priority: 'critical',
        category: 'urgent',
        title: `Traitements en retard`,
        description: `${overdueTreatments.length} traitement(s) à effectuer`,
        affectedCount: overdueTreatments.length,
        url: '/treatments?filter=overdue',
      });
    }

    // 3. THIS WEEK: Vaccinations due this week
    const vaccinationsDue = await this.prisma.treatment.findMany({
      where: {
        farmId,
        deletedAt: null,
        type: 'vaccination',
        nextDueDate: {
          gte: now,
          lte: oneWeekFromNow,
        },
        status: { not: 'completed' },
      },
    });

    if (vaccinationsDue.length > 0) {
      actions.push({
        id: 'vaccinations_due',
        type: 'vaccination_due',
        priority: 'high',
        category: 'this_week',
        title: `Vaccinations à effectuer`,
        description: `${vaccinationsDue.length} vaccination(s) prévue(s) cette semaine`,
        affectedCount: vaccinationsDue.length,
        url: '/treatments?type=vaccination',
      });
    }

    // 4. THIS WEEK: Overdue weighings (animals not weighed in 30+ days)
    const animalsNeedingWeighing = await this.prisma.animal.findMany({
      where: {
        farmId,
        deletedAt: null,
        status: 'alive',
        weights: {
          none: {
            weightDate: { gte: thirtyDaysAgo },
          },
        },
      },
      select: { id: true },
    });

    if (animalsNeedingWeighing.length > 0) {
      actions.push({
        id: 'weighing_overdue',
        type: 'weighing_overdue',
        priority: 'medium',
        category: 'this_week',
        title: `Pesées à effectuer`,
        description: `${animalsNeedingWeighing.length} animal(aux) non pesé(s) depuis 30 jours`,
        affectedCount: animalsNeedingWeighing.length,
        url: '/weights/new',
      });
    }

    // 5. OPPORTUNITIES: Animals at target weight (ready for sale)
    // Get animals with latest weight >= 500kg (configurable target)
    const targetWeight = 500;
    const animalsAtTarget = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT w.animal_id) as count
      FROM weights w
      INNER JOIN (
        SELECT animal_id, MAX(weight_date) as max_date
        FROM weights
        WHERE farm_id = ${farmId} AND deleted_at IS NULL
        GROUP BY animal_id
      ) latest ON w.animal_id = latest.animal_id AND w.weight_date = latest.max_date
      WHERE w.farm_id = ${farmId}
        AND w.deleted_at IS NULL
        AND w.weight >= ${targetWeight}
    `;

    const readyForSaleCount = Number(animalsAtTarget[0]?.count || 0);
    if (readyForSaleCount > 0) {
      actions.push({
        id: 'sale_ready',
        type: 'sale_ready',
        priority: 'success',
        category: 'opportunities',
        title: `Animaux prêts pour la vente`,
        description: `${readyForSaleCount} animal(aux) ont atteint le poids cible (${targetWeight}kg)`,
        affectedCount: readyForSaleCount,
        url: '/animals?minWeight=500',
      });
    }

    // Filter by urgency if specified
    let filteredActions = actions;
    if (query.urgency) {
      filteredActions = actions.filter(a => a.category === query.urgency);
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, success: 4 };
    filteredActions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return {
      success: true,
      data: {
        summary: {
          urgent: actions.filter(a => a.category === 'urgent').length,
          thisWeek: actions.filter(a => a.category === 'this_week').length,
          planned: actions.filter(a => a.category === 'planned').length,
          opportunities: actions.filter(a => a.category === 'opportunities').length,
        },
        actions: filteredActions,
      },
    };
  }

  /**
   * Get comprehensive dashboard statistics
   * Endpoint: GET /api/v1/farms/:farmId/dashboard/stats
   */
  async getStats(farmId: string, query: DashboardStatsQueryDto) {
    this.logger.debug(`Getting dashboard stats for farm ${farmId}`);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. HERD STATS
    const herdStats = await this.prisma.animal.groupBy({
      by: ['status'],
      where: { farmId, deletedAt: null },
      _count: true,
    });

    this.logger.debug(`Herd stats raw: ${JSON.stringify(herdStats)}`);

    const totalAnimals = herdStats.reduce((sum, s) => sum + s._count, 0);
    const statusBreakdown: Record<string, number> = {};
    herdStats.forEach(s => {
      statusBreakdown[s.status] = s._count;
    });

    const genderStats = await this.prisma.animal.groupBy({
      by: ['sex'],
      where: { farmId, deletedAt: null, status: 'alive' },
      _count: true,
    });

    this.logger.debug(`Gender stats raw: ${JSON.stringify(genderStats)}`);

    const genderBreakdown: Record<string, number> = {};
    genderStats.forEach(s => {
      genderBreakdown[s.sex] = s._count;
    });

    // Monthly changes (new animals this month)
    const newAnimalsThisMonth = await this.prisma.animal.count({
      where: {
        farmId,
        deletedAt: null,
        createdAt: { gte: startOfMonth },
      },
    });

    // 2. MOVEMENTS STATS - Get ALL movement types, not just predefined ones
    const movementsThisMonth = await this.prisma.movement.groupBy({
      by: ['movementType'],
      where: {
        farmId,
        deletedAt: null,
        movementDate: { gte: startOfMonth },
      },
      _count: true,
    });

    this.logger.debug(`Movements this month raw: ${JSON.stringify(movementsThisMonth)}`);

    // Build movements breakdown from actual data
    const movementsBreakdown: Record<string, number> = {};
    let totalMovementsThisMonth = 0;
    movementsThisMonth.forEach(m => {
      if (m.movementType) {
        movementsBreakdown[m.movementType] = m._count;
        totalMovementsThisMonth += m._count;
      }
    });

    // Also get all-time movement totals for reference
    const allMovements = await this.prisma.movement.groupBy({
      by: ['movementType'],
      where: {
        farmId,
        deletedAt: null,
      },
      _count: true,
    });

    this.logger.debug(`All movements raw: ${JSON.stringify(allMovements)}`);

    const allMovementsBreakdown: Record<string, number> = {};
    let totalAllMovements = 0;
    allMovements.forEach(m => {
      if (m.movementType) {
        allMovementsBreakdown[m.movementType] = m._count;
        totalAllMovements += m._count;
      }
    });

    // 3. WEIGHTS STATS
    const weightStats = await this.prisma.weight.aggregate({
      where: {
        farmId,
        deletedAt: null,
        weightDate: { gte: thirtyDaysAgo },
      },
      _avg: { weight: true },
      _count: true,
    });

    this.logger.debug(`Weight stats raw: ${JSON.stringify(weightStats)}`);

    // Calculate average ADG for the farm
    const weights = await this.prisma.weight.findMany({
      where: {
        farmId,
        deletedAt: null,
      },
      orderBy: { weightDate: 'asc' },
    });

    const weightsByAnimal = new Map<string, { weight: number; date: Date }[]>();
    weights.forEach(w => {
      if (!weightsByAnimal.has(w.animalId)) {
        weightsByAnimal.set(w.animalId, []);
      }
      weightsByAnimal.get(w.animalId)!.push({ weight: w.weight, date: w.weightDate });
    });

    const dailyGains: number[] = [];
    weightsByAnimal.forEach(animalWeights => {
      if (animalWeights.length >= 2) {
        const first = animalWeights[0];
        const last = animalWeights[animalWeights.length - 1];
        const daysDiff = Math.ceil(
          (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 0) {
          dailyGains.push((last.weight - first.weight) / daysDiff);
        }
      }
    });

    const avgDailyGain = dailyGains.length > 0
      ? Math.round((dailyGains.reduce((a, b) => a + b, 0) / dailyGains.length) * 1000) / 1000
      : 0;

    // 4. HEALTH STATS
    const activeWithdrawals = await this.prisma.lot.count({
      where: {
        farmId,
        deletedAt: null,
        completed: false,
        withdrawalEndDate: { gte: now },
      },
    });

    const treatmentsThisMonth = await this.prisma.treatment.count({
      where: {
        farmId,
        deletedAt: null,
        treatmentDate: { gte: startOfMonth },
      },
    });

    this.logger.debug(`Treatments this month: ${treatmentsThisMonth}`);

    // Vaccination coverage (animals with at least one vaccination)
    const vaccinatedAnimals = await this.prisma.treatment.findMany({
      where: {
        farmId,
        deletedAt: null,
        type: 'vaccination',
      },
      select: { animalId: true },
      distinct: ['animalId'],
    });

    const vaccinationCoverage = totalAnimals > 0
      ? Math.round((vaccinatedAnimals.length / totalAnimals) * 100)
      : 0;

    // 5. MORTALITY RATE
    const aliveCount = statusBreakdown['alive'] || 0;
    const deadCount = statusBreakdown['dead'] || 0;
    const soldCount = statusBreakdown['sold'] || 0;
    const slaughteredCount = statusBreakdown['slaughtered'] || 0;
    const totalEver = aliveCount + deadCount + soldCount + slaughteredCount;
    const mortalityRate = totalEver > 0
      ? Math.round((deadCount / totalEver) * 100 * 10) / 10
      : 0;

    // Mortality assessment
    let mortalityAssessment: 'good' | 'warning' | 'critical' = 'good';
    if (mortalityRate >= 5) mortalityAssessment = 'critical';
    else if (mortalityRate >= 2) mortalityAssessment = 'warning';

    // 6. ALERTS COUNT
    const actions = await this.getActions(farmId, {});
    const alertCounts = {
      urgent: actions.data.summary.urgent,
      warning: actions.data.summary.thisWeek,
      info: actions.data.summary.planned + actions.data.summary.opportunities,
    };

    return {
      success: true,
      data: {
        herd: {
          total: totalAnimals,
          alive: aliveCount,
          statusBreakdown,
          genderBreakdown,
          monthlyChange: newAnimalsThisMonth,
        },
        movements: {
          thisMonth: movementsBreakdown,
          thisMonthTotal: totalMovementsThisMonth,
          allTime: allMovementsBreakdown,
          allTimeTotal: totalAllMovements,
        },
        weights: {
          avgWeight: Math.round((weightStats._avg.weight || 0) * 10) / 10,
          avgDailyGain,
          weighingsLast30Days: weightStats._count,
          totalWeights: weights.length,
        },
        health: {
          vaccinationCoverage,
          vaccinatedAnimals: vaccinatedAnimals.length,
          activeWithdrawals,
          treatmentsThisMonth,
        },
        mortality: {
          rate: mortalityRate,
          assessment: mortalityAssessment,
          threshold: { warning: 2, critical: 5 },
        },
        alerts: alertCounts,
        lastUpdated: new Date(),
      },
    };
  }
}
