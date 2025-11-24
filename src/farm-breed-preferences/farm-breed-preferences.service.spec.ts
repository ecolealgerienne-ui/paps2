import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FarmBreedPreferencesService } from './farm-breed-preferences.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';

describe('FarmBreedPreferencesService - PHASE_20', () => {
  let service: FarmBreedPreferencesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    farm: {
      findFirst: jest.fn(),
    },
    breed: {
      findFirst: jest.fn(),
    },
    farmBreedPreference: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockLogger = {
    debug: jest.fn(),
    audit: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmBreedPreferencesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FarmBreedPreferencesService>(FarmBreedPreferencesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock the logger
    (service as any).logger = mockLogger;

    jest.clearAllMocks();
  });

  describe('findByFarm', () => {
    it('should return breed preferences for a valid farm', async () => {
      const farmId = 'farm-123';
      const mockFarm = {
        id: farmId,
        name: 'Test Farm',
        deletedAt: null,
      };

      const mockPreferences = [
        {
          id: 'pref-1',
          farmId,
          breedId: 'breed-1',
          displayOrder: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          breed: {
            id: 'breed-1',
            code: 'lacaune',
            nameFr: 'Lacaune',
            nameEn: 'Lacaune',
            nameAr: 'لاكون',
            speciesId: 'species-1',
          },
        },
      ];

      mockPrismaService.farm.findFirst.mockResolvedValue(mockFarm);
      mockPrismaService.farmBreedPreference.findMany.mockResolvedValue(mockPreferences);

      const result = await service.findByFarm(farmId);

      expect(result).toEqual(mockPreferences);
      expect(mockPrismaService.farm.findFirst).toHaveBeenCalledWith({
        where: { id: farmId, deletedAt: null },
      });
      expect(mockPrismaService.farmBreedPreference.findMany).toHaveBeenCalledWith({
        where: { farmId, isActive: true },
        include: expect.any(Object),
        orderBy: { displayOrder: 'asc' },
      });
    });

    it('should throw NotFoundException if farm does not exist', async () => {
      const farmId = 'non-existent-farm';
      mockPrismaService.farm.findFirst.mockResolvedValue(null);

      await expect(service.findByFarm(farmId)).rejects.toThrow(NotFoundException);
      await expect(service.findByFarm(farmId)).rejects.toThrow(
        `Farm with ID ${farmId} not found`,
      );
    });

    it('should include inactive preferences when requested', async () => {
      const farmId = 'farm-123';
      const mockFarm = { id: farmId, deletedAt: null };

      mockPrismaService.farm.findFirst.mockResolvedValue(mockFarm);
      mockPrismaService.farmBreedPreference.findMany.mockResolvedValue([]);

      await service.findByFarm(farmId, true);

      expect(mockPrismaService.farmBreedPreference.findMany).toHaveBeenCalledWith({
        where: { farmId },
        include: expect.any(Object),
        orderBy: { displayOrder: 'asc' },
      });
    });
  });

  describe('add', () => {
    it('should create a new breed preference', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';

      const mockFarm = { id: farmId, deletedAt: null };
      const mockBreed = {
        id: breedId,
        code: 'lacaune',
        nameFr: 'Lacaune',
        deletedAt: null,
      };

      const mockPreference = {
        id: 'pref-1',
        farmId,
        breedId,
        displayOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        breed: {
          id: breedId,
          code: 'lacaune',
          nameFr: 'Lacaune',
          nameEn: 'Lacaune',
          nameAr: 'لاكون',
          speciesId: 'species-1',
        },
      };

      mockPrismaService.farm.findFirst.mockResolvedValue(mockFarm);
      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);
      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValueOnce(null); // For existence check
      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValueOnce(null); // For max order check
      mockPrismaService.farmBreedPreference.create.mockResolvedValue(mockPreference);

      const result = await service.add(farmId, breedId);

      expect(result).toEqual(mockPreference);
      expect(mockPrismaService.farmBreedPreference.create).toHaveBeenCalledWith({
        data: { farmId, breedId, displayOrder: 0 },
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException if preference already exists and is active', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';

      const mockFarm = { id: farmId, deletedAt: null };
      const mockBreed = { id: breedId, deletedAt: null };
      const mockExisting = {
        id: 'pref-1',
        farmId,
        breedId,
        isActive: true,
      };

      mockPrismaService.farm.findFirst.mockResolvedValue(mockFarm);
      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);
      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValue(mockExisting);

      await expect(service.add(farmId, breedId)).rejects.toThrow(ConflictException);
    });

    it('should reactivate preference if it exists but is inactive', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';

      const mockFarm = { id: farmId, deletedAt: null };
      const mockBreed = { id: breedId, deletedAt: null };
      const mockExisting = {
        id: 'pref-1',
        farmId,
        breedId,
        isActive: false,
      };

      const mockReactivated = {
        ...mockExisting,
        isActive: true,
        breed: {
          id: breedId,
          code: 'lacaune',
          nameFr: 'Lacaune',
          nameEn: 'Lacaune',
          nameAr: 'لاكون',
          speciesId: 'species-1',
        },
      };

      mockPrismaService.farm.findFirst.mockResolvedValue(mockFarm);
      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);
      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValue(mockExisting);
      mockPrismaService.farmBreedPreference.update.mockResolvedValue(mockReactivated);

      const result = await service.add(farmId, breedId);

      expect(result).toEqual(mockReactivated);
      expect(mockPrismaService.farmBreedPreference.update).toHaveBeenCalledWith({
        where: { id: mockExisting.id },
        data: { isActive: true },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if farm does not exist', async () => {
      const farmId = 'non-existent';
      const breedId = 'breed-456';

      mockPrismaService.farm.findFirst.mockResolvedValue(null);

      await expect(service.add(farmId, breedId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if breed does not exist', async () => {
      const farmId = 'farm-123';
      const breedId = 'non-existent';

      mockPrismaService.farm.findFirst.mockResolvedValue({ id: farmId });
      mockPrismaService.breed.findFirst.mockResolvedValue(null);

      await expect(service.add(farmId, breedId)).rejects.toThrow(NotFoundException);
    });

    it('should set correct display order when adding to existing preferences', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';

      const mockFarm = { id: farmId, deletedAt: null };
      const mockBreed = { id: breedId, deletedAt: null };
      const mockMaxOrder = { displayOrder: 5 };

      mockPrismaService.farm.findFirst.mockResolvedValue(mockFarm);
      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);
      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValueOnce(null); // For existence check
      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValueOnce(mockMaxOrder); // For max order check
      mockPrismaService.farmBreedPreference.create.mockResolvedValue({
        id: 'pref-1',
        farmId,
        breedId,
        displayOrder: 6,
        breed: {},
      });

      await service.add(farmId, breedId);

      expect(mockPrismaService.farmBreedPreference.create).toHaveBeenCalledWith({
        data: { farmId, breedId, displayOrder: 6 },
        include: expect.any(Object),
      });
    });
  });

  describe('remove', () => {
    it('should delete an existing preference', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';

      const mockPreference = {
        id: 'pref-1',
        farmId,
        breedId,
      };

      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValue(mockPreference);
      mockPrismaService.farmBreedPreference.delete.mockResolvedValue(mockPreference);

      const result = await service.remove(farmId, breedId);

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.farmBreedPreference.delete).toHaveBeenCalledWith({
        where: { id: mockPreference.id },
      });
    });

    it('should throw NotFoundException if preference does not exist', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';

      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValue(null);

      await expect(service.remove(farmId, breedId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorder', () => {
    it('should update display order of an existing preference', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';
      const displayOrder = 3;

      const mockPreference = {
        id: 'pref-1',
        farmId,
        breedId,
        displayOrder: 1,
      };

      const mockUpdated = {
        ...mockPreference,
        displayOrder,
        breed: {
          id: breedId,
          code: 'lacaune',
          nameFr: 'Lacaune',
          nameEn: 'Lacaune',
          nameAr: 'لاكون',
          speciesId: 'species-1',
        },
      };

      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValue(mockPreference);
      mockPrismaService.farmBreedPreference.update.mockResolvedValue(mockUpdated);

      const result = await service.reorder(farmId, breedId, displayOrder);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.farmBreedPreference.update).toHaveBeenCalledWith({
        where: { id: mockPreference.id },
        data: { displayOrder },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if preference does not exist', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';

      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValue(null);

      await expect(service.reorder(farmId, breedId, 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status of an existing preference', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';
      const isActive = false;

      const mockPreference = {
        id: 'pref-1',
        farmId,
        breedId,
        isActive: true,
      };

      const mockUpdated = {
        ...mockPreference,
        isActive,
        breed: {
          id: breedId,
          code: 'lacaune',
          nameFr: 'Lacaune',
          nameEn: 'Lacaune',
          nameAr: 'لاكون',
          speciesId: 'species-1',
        },
      };

      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValue(mockPreference);
      mockPrismaService.farmBreedPreference.update.mockResolvedValue(mockUpdated);

      const result = await service.toggleActive(farmId, breedId, isActive);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.farmBreedPreference.update).toHaveBeenCalledWith({
        where: { id: mockPreference.id },
        data: { isActive },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if preference does not exist', async () => {
      const farmId = 'farm-123';
      const breedId = 'breed-456';

      mockPrismaService.farmBreedPreference.findFirst.mockResolvedValue(null);

      await expect(service.toggleActive(farmId, breedId, false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
