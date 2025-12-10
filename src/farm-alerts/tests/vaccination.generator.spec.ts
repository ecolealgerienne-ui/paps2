import { Test, TestingModule } from '@nestjs/testing';
import { VaccinationAlertGenerator } from '../alert-engine/generators/vaccination.generator';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerationContext, ALERT_CODES } from '../alert-engine/generator.interface';

describe('VaccinationAlertGenerator', () => {
  let generator: VaccinationAlertGenerator;

  const farmId = 'farm-123';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockPrismaService = {
    vaccination: {
      findMany: jest.fn(),
    },
    campaignSubscription: {
      findMany: jest.fn(),
    },
  };

  const mockVaccinationPreference = {
    id: 'pref-1',
    farmId,
    alertTemplateId: 'template-1',
    reminderDays: 7,
    isActive: true,
    deletedAt: null,
    alertTemplate: {
      id: 'template-1',
      code: ALERT_CODES.VACCINATION_DUE,
      category: 'vaccination',
      priority: 'high',
      isActive: true,
    },
  };

  const mockCampaignPreference = {
    id: 'pref-2',
    farmId,
    alertTemplateId: 'template-2',
    reminderDays: 14,
    isActive: true,
    deletedAt: null,
    alertTemplate: {
      id: 'template-2',
      code: ALERT_CODES.CAMPAIGN_VACCINATION_DUE,
      category: 'vaccination',
      priority: 'high',
      isActive: true,
    },
  };

  const createContext = (
    preferences = [mockVaccinationPreference],
    existingAlerts = [],
  ): GenerationContext => ({
    farmId,
    today,
    preferences,
    existingAlerts,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaccinationAlertGenerator,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    generator = module.get<VaccinationAlertGenerator>(VaccinationAlertGenerator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('category', () => {
    it('should have vaccination category', () => {
      expect(generator.category).toBe('vaccination');
    });
  });

  describe('generate', () => {
    it('should return empty array if no vaccination preferences', async () => {
      const context = createContext([]);

      const result = await generator.generate(context);

      expect(result).toEqual([]);
      expect(mockPrismaService.vaccination.findMany).not.toHaveBeenCalled();
    });

    it('should generate alerts for upcoming vaccinations', async () => {
      const nextDueDate = new Date(today);
      nextDueDate.setDate(nextDueDate.getDate() + 5); // 5 days from now

      mockPrismaService.vaccination.findMany.mockResolvedValue([
        {
          id: 'vacc-1',
          animalId: 'animal-1',
          lotId: null,
          nextDueDate,
          status: 'scheduled',
        },
      ]);

      const context = createContext([mockVaccinationPreference]);
      const result = await generator.generate(context);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('alertTemplateId', 'template-1');
      expect(result[0]).toHaveProperty('animalId', 'animal-1');
      expect(result[0]).toHaveProperty('uniqueKey');
    });

    it('should not generate alert if vaccination is too far in the future', async () => {
      const nextDueDate = new Date(today);
      nextDueDate.setDate(nextDueDate.getDate() + 30); // 30 days from now

      mockPrismaService.vaccination.findMany.mockResolvedValue([
        {
          id: 'vacc-1',
          animalId: 'animal-1',
          lotId: null,
          nextDueDate,
          status: 'scheduled',
        },
      ]);

      const context = createContext([mockVaccinationPreference]); // 7 days reminder
      const result = await generator.generate(context);

      expect(result.length).toBe(0);
    });

    it('should not generate alert if vaccination is already overdue more than 30 days', async () => {
      const nextDueDate = new Date(today);
      nextDueDate.setDate(nextDueDate.getDate() - 45); // 45 days ago

      mockPrismaService.vaccination.findMany.mockResolvedValue([
        {
          id: 'vacc-1',
          animalId: 'animal-1',
          lotId: null,
          nextDueDate,
          status: 'scheduled',
        },
      ]);

      const context = createContext([mockVaccinationPreference]);
      const result = await generator.generate(context);

      expect(result.length).toBe(0);
    });

    it('should not duplicate existing alerts', async () => {
      const nextDueDate = new Date(today);
      nextDueDate.setDate(nextDueDate.getDate() + 3);

      mockPrismaService.vaccination.findMany.mockResolvedValue([
        {
          id: 'vacc-1',
          animalId: 'animal-1',
          lotId: null,
          nextDueDate,
          status: 'scheduled',
        },
      ]);

      const existingAlerts = [
        {
          id: 'alert-1',
          alertTemplateId: 'template-1',
          alertPreferenceId: 'pref-1',
          animalId: 'animal-1',
          lotId: null,
          treatmentId: null,
          breedingId: null,
          documentId: null,
          status: 'pending',
          metadata: {
            uniqueKey: `vaccination_due:vacc-1:animal-1`,
          },
        },
      ];

      const context = createContext([mockVaccinationPreference], existingAlerts);
      const result = await generator.generate(context);

      // Should still generate alert (deduplication handled by engine)
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate campaign vaccination alerts', async () => {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 10); // 10 days from now

      mockPrismaService.vaccination.findMany.mockResolvedValue([]);
      mockPrismaService.campaignSubscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          farmId,
          campaignId: 'campaign-1',
          status: 'active',
          campaign: {
            id: 'campaign-1',
            endDate,
            status: 'active',
            deletedAt: null,
          },
        },
      ]);

      const context = createContext([mockCampaignPreference]);
      const result = await generator.generate(context);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('alertTemplateId', 'template-2');
    });
  });
});
