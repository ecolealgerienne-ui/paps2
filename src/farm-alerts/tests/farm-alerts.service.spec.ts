import { Test, TestingModule } from '@nestjs/testing';
import { FarmAlertsService } from '../farm-alerts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EntityNotFoundException } from '../../common/exceptions';
import { FarmAlertStatus, ReadPlatform } from '../types';

describe('FarmAlertsService', () => {
  let service: FarmAlertsService;

  const mockPrismaService = {
    farmAlert: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const farmId = 'farm-123';
  const alertId = 'alert-456';

  const mockAlert = {
    id: alertId,
    farmId,
    alertTemplateId: 'template-789',
    alertPreferenceId: 'pref-101',
    animalId: 'animal-111',
    lotId: null,
    treatmentId: null,
    breedingId: null,
    documentId: null,
    dueDate: new Date('2024-01-15'),
    expiresAt: null,
    status: FarmAlertStatus.PENDING,
    readAt: null,
    readPlatform: null,
    resolvedAt: null,
    dismissedAt: null,
    metadata: { uniqueKey: 'test-key' },
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmAlertsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FarmAlertsService>(FarmAlertsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated alerts', async () => {
      const alerts = [mockAlert];
      mockPrismaService.farmAlert.findMany.mockResolvedValue(alerts);
      mockPrismaService.farmAlert.count.mockResolvedValue(1);

      const result = await service.findAll(farmId, { page: 1, limit: 20 });

      expect(result.data).toEqual(alerts);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should filter by status', async () => {
      mockPrismaService.farmAlert.findMany.mockResolvedValue([]);
      mockPrismaService.farmAlert.count.mockResolvedValue(0);

      await service.findAll(farmId, { status: FarmAlertStatus.PENDING });

      expect(mockPrismaService.farmAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: FarmAlertStatus.PENDING,
          }),
        }),
      );
    });

    it('should filter by category', async () => {
      mockPrismaService.farmAlert.findMany.mockResolvedValue([]);
      mockPrismaService.farmAlert.count.mockResolvedValue(0);

      await service.findAll(farmId, { category: 'vaccination' });

      expect(mockPrismaService.farmAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            alertTemplate: { category: 'vaccination' },
          }),
        }),
      );
    });

    it('should filter by animalId', async () => {
      mockPrismaService.farmAlert.findMany.mockResolvedValue([]);
      mockPrismaService.farmAlert.count.mockResolvedValue(0);

      await service.findAll(farmId, { animalId: 'animal-123' });

      expect(mockPrismaService.farmAlert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            animalId: 'animal-123',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an alert by id', async () => {
      mockPrismaService.farmAlert.findFirst.mockResolvedValue(mockAlert);

      const result = await service.findOne(farmId, alertId);

      expect(result).toEqual(mockAlert);
      expect(mockPrismaService.farmAlert.findFirst).toHaveBeenCalledWith({
        where: { id: alertId, farmId, deletedAt: null },
        include: expect.any(Object),
      });
    });

    it('should throw EntityNotFoundException if alert not found', async () => {
      mockPrismaService.farmAlert.findFirst.mockResolvedValue(null);

      await expect(service.findOne(farmId, 'invalid-id')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should mark alert as read', async () => {
      mockPrismaService.farmAlert.findFirst.mockResolvedValue(mockAlert);
      mockPrismaService.farmAlert.update.mockResolvedValue({
        ...mockAlert,
        status: FarmAlertStatus.READ,
        readAt: new Date(),
        readPlatform: ReadPlatform.WEB,
      });

      const result = await service.updateStatus(farmId, alertId, {
        status: FarmAlertStatus.READ,
        platform: ReadPlatform.WEB,
        version: 1,
      });

      expect(result.status).toBe(FarmAlertStatus.READ);
      expect(mockPrismaService.farmAlert.update).toHaveBeenCalled();
    });

    it('should mark alert as dismissed', async () => {
      mockPrismaService.farmAlert.findFirst.mockResolvedValue(mockAlert);
      mockPrismaService.farmAlert.update.mockResolvedValue({
        ...mockAlert,
        status: FarmAlertStatus.DISMISSED,
        dismissedAt: new Date(),
      });

      const result = await service.updateStatus(farmId, alertId, {
        status: FarmAlertStatus.DISMISSED,
        version: 1,
      });

      expect(result.status).toBe(FarmAlertStatus.DISMISSED);
    });

    it('should mark alert as resolved', async () => {
      mockPrismaService.farmAlert.findFirst.mockResolvedValue(mockAlert);
      mockPrismaService.farmAlert.update.mockResolvedValue({
        ...mockAlert,
        status: FarmAlertStatus.RESOLVED,
        resolvedAt: new Date(),
      });

      const result = await service.updateStatus(farmId, alertId, {
        status: FarmAlertStatus.RESOLVED,
        version: 1,
      });

      expect(result.status).toBe(FarmAlertStatus.RESOLVED);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all pending alerts as read', async () => {
      mockPrismaService.farmAlert.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(farmId, ReadPlatform.MOBILE);

      expect(result).toBe(5);
      expect(mockPrismaService.farmAlert.updateMany).toHaveBeenCalledWith({
        where: {
          farmId,
          deletedAt: null,
          status: FarmAlertStatus.PENDING,
        },
        data: expect.objectContaining({
          status: FarmAlertStatus.READ,
          readPlatform: ReadPlatform.MOBILE,
        }),
      });
    });
  });

  describe('getSummary', () => {
    it('should return alert summary by category', async () => {
      mockPrismaService.farmAlert.findMany.mockResolvedValue([
        {
          ...mockAlert,
          alertTemplate: { category: 'vaccination' },
        },
        {
          ...mockAlert,
          id: 'alert-2',
          alertTemplate: { category: 'vaccination' },
        },
        {
          ...mockAlert,
          id: 'alert-3',
          alertTemplate: { category: 'treatment' },
        },
      ]);

      const result = await service.getSummary(farmId);

      expect(result).toHaveProperty('byCategory');
      expect(result).toHaveProperty('byPriority');
      expect(result).toHaveProperty('byStatus');
      expect(result).toHaveProperty('total');
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of pending alerts', async () => {
      mockPrismaService.farmAlert.count.mockResolvedValue(10);

      const result = await service.getUnreadCount(farmId);

      expect(result).toBe(10);
      expect(mockPrismaService.farmAlert.count).toHaveBeenCalledWith({
        where: {
          farmId,
          deletedAt: null,
          status: FarmAlertStatus.PENDING,
        },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete an alert', async () => {
      mockPrismaService.farmAlert.findFirst.mockResolvedValue(mockAlert);
      mockPrismaService.farmAlert.update.mockResolvedValue({
        ...mockAlert,
        deletedAt: new Date(),
      });

      const result = await service.remove(farmId, alertId);

      expect(result.deletedAt).not.toBeNull();
      expect(mockPrismaService.farmAlert.update).toHaveBeenCalledWith({
        where: { id: alertId },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple alerts', async () => {
      const alertIds = ['alert-1', 'alert-2'];
      mockPrismaService.farmAlert.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.bulkUpdate(farmId, {
        alertIds,
        status: FarmAlertStatus.READ,
        platform: ReadPlatform.WEB,
      });

      expect(result).toBe(2);
    });
  });
});
