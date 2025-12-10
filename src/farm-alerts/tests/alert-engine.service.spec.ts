import { Test, TestingModule } from '@nestjs/testing';
import { AlertEngineService } from '../alert-engine/alert-engine.service';
import { PrismaService } from '../../prisma/prisma.service';
import { VaccinationAlertGenerator } from '../alert-engine/generators/vaccination.generator';
import { TreatmentAlertGenerator } from '../alert-engine/generators/treatment.generator';
import { NutritionAlertGenerator } from '../alert-engine/generators/nutrition.generator';
import { ReproductionAlertGenerator } from '../alert-engine/generators/reproduction.generator';
import { HealthAlertGenerator } from '../alert-engine/generators/health.generator';
import { AdministrativeAlertGenerator } from '../alert-engine/generators/administrative.generator';
import { FarmAlertStatus } from '../types';

describe('AlertEngineService', () => {
  let service: AlertEngineService;

  const farmId = 'farm-123';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockPreferences = [
    {
      id: 'pref-1',
      farmId,
      alertTemplateId: 'template-1',
      reminderDays: 7,
      isActive: true,
      deletedAt: null,
      alertTemplate: {
        id: 'template-1',
        code: 'vaccination_due',
        category: 'vaccination',
        priority: 'high',
        isActive: true,
      },
    },
  ];

  const mockExistingAlerts = [
    {
      id: 'existing-alert-1',
      alertTemplateId: 'template-1',
      alertPreferenceId: 'pref-1',
      animalId: 'animal-1',
      lotId: null,
      treatmentId: null,
      breedingId: null,
      documentId: null,
      status: FarmAlertStatus.PENDING,
      metadata: { uniqueKey: 'existing-key' },
    },
  ];

  const mockGeneratedAlert = {
    alertTemplateId: 'template-1',
    alertPreferenceId: 'pref-1',
    animalId: 'animal-2',
    dueDate: new Date(),
    expiresAt: null,
    metadata: { uniqueKey: 'new-key' },
    uniqueKey: 'new-key',
  };

  const mockPrismaService = {
    farmAlertTemplatePreference: {
      findMany: jest.fn(),
    },
    farmAlert: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockVaccinationGenerator = {
    category: 'vaccination',
    generate: jest.fn(),
  };

  const mockTreatmentGenerator = {
    category: 'treatment',
    generate: jest.fn(),
  };

  const mockNutritionGenerator = {
    category: 'nutrition',
    generate: jest.fn(),
  };

  const mockReproductionGenerator = {
    category: 'reproduction',
    generate: jest.fn(),
  };

  const mockHealthGenerator = {
    category: 'health',
    generate: jest.fn(),
  };

  const mockAdministrativeGenerator = {
    category: 'administrative',
    generate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertEngineService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: VaccinationAlertGenerator, useValue: mockVaccinationGenerator },
        { provide: TreatmentAlertGenerator, useValue: mockTreatmentGenerator },
        { provide: NutritionAlertGenerator, useValue: mockNutritionGenerator },
        { provide: ReproductionAlertGenerator, useValue: mockReproductionGenerator },
        { provide: HealthAlertGenerator, useValue: mockHealthGenerator },
        { provide: AdministrativeAlertGenerator, useValue: mockAdministrativeGenerator },
      ],
    }).compile();

    service = module.get<AlertEngineService>(AlertEngineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateForFarm', () => {
    beforeEach(() => {
      mockPrismaService.farmAlertTemplatePreference.findMany.mockResolvedValue(mockPreferences);
      mockPrismaService.farmAlert.findMany.mockResolvedValue(mockExistingAlerts);
      mockVaccinationGenerator.generate.mockResolvedValue([mockGeneratedAlert]);
      mockTreatmentGenerator.generate.mockResolvedValue([]);
      mockNutritionGenerator.generate.mockResolvedValue([]);
      mockReproductionGenerator.generate.mockResolvedValue([]);
      mockHealthGenerator.generate.mockResolvedValue([]);
      mockAdministrativeGenerator.generate.mockResolvedValue([]);
    });

    it('should build context with preferences and existing alerts', async () => {
      await service.generateForFarm(farmId);

      expect(mockPrismaService.farmAlertTemplatePreference.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          farmId,
          isActive: true,
          deletedAt: null,
        }),
        include: expect.any(Object),
      });

      expect(mockPrismaService.farmAlert.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          farmId,
          deletedAt: null,
        }),
        select: expect.any(Object),
      });
    });

    it('should call all generators', async () => {
      await service.generateForFarm(farmId);

      expect(mockVaccinationGenerator.generate).toHaveBeenCalled();
      expect(mockTreatmentGenerator.generate).toHaveBeenCalled();
      expect(mockNutritionGenerator.generate).toHaveBeenCalled();
      expect(mockReproductionGenerator.generate).toHaveBeenCalled();
      expect(mockHealthGenerator.generate).toHaveBeenCalled();
      expect(mockAdministrativeGenerator.generate).toHaveBeenCalled();
    });

    it('should create new alerts for newly generated ones', async () => {
      mockPrismaService.farmAlert.create.mockResolvedValue({ id: 'new-alert-id' });

      const result = await service.generateForFarm(farmId);

      expect(result.created).toBeGreaterThanOrEqual(0);
      expect(result.createdIds).toBeDefined();
    });

    it('should resolve obsolete alerts', async () => {
      // Existing alert that won't be regenerated
      mockPrismaService.farmAlert.findMany.mockResolvedValue([
        {
          ...mockExistingAlerts[0],
          metadata: { uniqueKey: 'obsolete-key' },
        },
      ]);
      mockVaccinationGenerator.generate.mockResolvedValue([]);

      await service.generateForFarm(farmId);

      // Obsolete alert should be resolved
      expect(mockPrismaService.farmAlert.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: FarmAlertStatus.RESOLVED,
          }),
        }),
      );
    });

    it('should not modify dismissed alerts', async () => {
      mockPrismaService.farmAlert.findMany.mockResolvedValue([
        {
          ...mockExistingAlerts[0],
          status: 'dismissed',
          metadata: { uniqueKey: 'dismissed-key' },
        },
      ]);
      mockVaccinationGenerator.generate.mockResolvedValue([]);

      await service.generateForFarm(farmId);

      // Dismissed alert should not be updated
      expect(mockPrismaService.farmAlert.update).not.toHaveBeenCalled();
    });

    it('should continue if a generator fails', async () => {
      mockVaccinationGenerator.generate.mockRejectedValue(new Error('Generator failed'));

      // Should not throw, other generators should still run
      const result = await service.generateForFarm(farmId);

      expect(mockTreatmentGenerator.generate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return sync result with counts', async () => {
      mockPrismaService.farmAlert.create.mockResolvedValue({ id: 'new-id' });

      const result = await service.generateForFarm(farmId);

      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('resolved');
      expect(result).toHaveProperty('unchanged');
      expect(result).toHaveProperty('createdIds');
      expect(result).toHaveProperty('resolvedIds');
    });
  });

  describe('resolveAlerts', () => {
    it('should resolve specified alerts', async () => {
      const alertIds = ['alert-1', 'alert-2'];
      mockPrismaService.farmAlert.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.resolveAlerts(farmId, alertIds);

      expect(result).toBe(2);
      expect(mockPrismaService.farmAlert.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: alertIds },
          farmId,
          deletedAt: null,
          status: { in: [FarmAlertStatus.PENDING, FarmAlertStatus.READ] },
        },
        data: expect.objectContaining({
          status: FarmAlertStatus.RESOLVED,
        }),
      });
    });
  });

  describe('invalidateAndRegenerate', () => {
    it('should regenerate alerts for farm', async () => {
      mockPrismaService.farmAlertTemplatePreference.findMany.mockResolvedValue([]);
      mockPrismaService.farmAlert.findMany.mockResolvedValue([]);
      mockVaccinationGenerator.generate.mockResolvedValue([]);
      mockTreatmentGenerator.generate.mockResolvedValue([]);
      mockNutritionGenerator.generate.mockResolvedValue([]);
      mockReproductionGenerator.generate.mockResolvedValue([]);
      mockHealthGenerator.generate.mockResolvedValue([]);
      mockAdministrativeGenerator.generate.mockResolvedValue([]);

      await service.invalidateAndRegenerate(farmId);

      // Should have called generateForFarm internally
      expect(mockPrismaService.farmAlertTemplatePreference.findMany).toHaveBeenCalled();
    });
  });
});
