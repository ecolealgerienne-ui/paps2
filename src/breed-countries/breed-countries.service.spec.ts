import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BreedCountriesService } from './breed-countries.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';

describe('BreedCountriesService - PHASE_16', () => {
  let service: BreedCountriesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    breed: {
      findFirst: jest.fn(),
    },
    country: {
      findUnique: jest.fn(),
    },
    breedCountry: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
        BreedCountriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BreedCountriesService>(BreedCountriesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock the logger
    (service as any).logger = mockLogger;

    jest.clearAllMocks();
  });

  describe('findCountriesByBreed', () => {
    it('should return countries for a valid breed', async () => {
      const breedId = 'breed-123';
      const mockBreed = {
        id: breedId,
        code: 'lacaune',
        nameFr: 'Lacaune',
        deletedAt: null,
      };

      const mockAssociations = [
        {
          id: 'assoc-1',
          breedId,
          countryCode: 'FR',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          breed: {
            id: breedId,
            code: 'lacaune',
            nameFr: 'Lacaune',
            nameEn: 'Lacaune',
            nameAr: 'لاكون',
          },
          country: {
            code: 'FR',
            nameFr: 'France',
            nameEn: 'France',
            nameAr: 'فرنسا',
            region: 'Europe',
          },
        },
      ];

      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);
      mockPrismaService.breedCountry.findMany.mockResolvedValue(mockAssociations);

      const result = await service.findCountriesByBreed(breedId);

      expect(result).toEqual(mockAssociations);
      expect(mockPrismaService.breed.findFirst).toHaveBeenCalledWith({
        where: { id: breedId, deletedAt: null },
      });
      expect(mockPrismaService.breedCountry.findMany).toHaveBeenCalledWith({
        where: { breedId, isActive: true },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should throw NotFoundException if breed does not exist', async () => {
      const breedId = 'non-existent-breed';
      mockPrismaService.breed.findFirst.mockResolvedValue(null);

      await expect(service.findCountriesByBreed(breedId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findCountriesByBreed(breedId)).rejects.toThrow(
        `Breed with ID ${breedId} not found`,
      );
    });
  });

  describe('findBreedsByCountry', () => {
    it('should return breeds for a valid country', async () => {
      const countryCode = 'DZ';
      const mockCountry = {
        code: countryCode,
        nameFr: 'Algérie',
        nameEn: 'Algeria',
        nameAr: 'الجزائر',
      };

      const mockAssociations = [
        {
          id: 'assoc-1',
          breedId: 'breed-123',
          countryCode,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          breed: {
            id: 'breed-123',
            code: 'ouled_djellal',
            nameFr: 'Ouled Djellal',
            nameEn: 'Ouled Djellal',
            nameAr: 'أولاد جلال',
            deletedAt: null,
          },
          country: mockCountry,
        },
      ];

      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.breedCountry.findMany.mockResolvedValue(mockAssociations);

      const result = await service.findBreedsByCountry(countryCode);

      expect(result).toEqual(mockAssociations);
      expect(mockPrismaService.country.findUnique).toHaveBeenCalledWith({
        where: { code: countryCode },
      });
    });

    it('should throw NotFoundException if country does not exist', async () => {
      const countryCode = 'XX';
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      await expect(service.findBreedsByCountry(countryCode)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findBreedsByCountry(countryCode)).rejects.toThrow(
        `Country with code ${countryCode} not found`,
      );
    });
  });

  describe('link', () => {
    it('should create a new breed-country association', async () => {
      const breedId = 'breed-123';
      const countryCode = 'FR';

      const mockBreed = {
        id: breedId,
        code: 'lacaune',
        deletedAt: null,
      };

      const mockCountry = {
        code: countryCode,
        nameFr: 'France',
      };

      const mockAssociation = {
        id: 'assoc-1',
        breedId,
        countryCode,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        breed: {
          id: breedId,
          code: 'lacaune',
          nameFr: 'Lacaune',
          nameEn: 'Lacaune',
          nameAr: 'لاكون',
        },
        country: mockCountry,
      };

      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.breedCountry.findFirst.mockResolvedValue(null);
      mockPrismaService.breedCountry.create.mockResolvedValue(mockAssociation);

      const result = await service.link(breedId, countryCode);

      expect(result).toEqual(mockAssociation);
      expect(mockPrismaService.breedCountry.create).toHaveBeenCalledWith({
        data: { breedId, countryCode },
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException if association already exists and is active', async () => {
      const breedId = 'breed-123';
      const countryCode = 'FR';

      const mockBreed = { id: breedId, deletedAt: null };
      const mockCountry = { code: countryCode };
      const mockExisting = {
        id: 'assoc-1',
        breedId,
        countryCode,
        isActive: true,
      };

      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.breedCountry.findFirst.mockResolvedValue(mockExisting);

      await expect(service.link(breedId, countryCode)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should reactivate association if it exists but is inactive', async () => {
      const breedId = 'breed-123';
      const countryCode = 'FR';

      const mockBreed = { id: breedId, deletedAt: null };
      const mockCountry = { code: countryCode };
      const mockExisting = {
        id: 'assoc-1',
        breedId,
        countryCode,
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
        },
        country: mockCountry,
      };

      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.breedCountry.findFirst.mockResolvedValue(mockExisting);
      mockPrismaService.breedCountry.update.mockResolvedValue(mockReactivated);

      const result = await service.link(breedId, countryCode);

      expect(result).toEqual(mockReactivated);
      expect(mockPrismaService.breedCountry.update).toHaveBeenCalledWith({
        where: { id: mockExisting.id },
        data: { isActive: true },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if breed does not exist', async () => {
      const breedId = 'non-existent';
      const countryCode = 'FR';

      mockPrismaService.breed.findFirst.mockResolvedValue(null);

      await expect(service.link(breedId, countryCode)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if country does not exist', async () => {
      const breedId = 'breed-123';
      const countryCode = 'XX';

      mockPrismaService.breed.findFirst.mockResolvedValue({ id: breedId });
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      await expect(service.link(breedId, countryCode)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unlink', () => {
    it('should deactivate an active association', async () => {
      const breedId = 'breed-123';
      const countryCode = 'FR';

      const mockAssociation = {
        id: 'assoc-1',
        breedId,
        countryCode,
        isActive: true,
      };

      const mockUpdated = {
        ...mockAssociation,
        isActive: false,
      };

      mockPrismaService.breedCountry.findFirst.mockResolvedValue(mockAssociation);
      mockPrismaService.breedCountry.update.mockResolvedValue(mockUpdated);

      const result = await service.unlink(breedId, countryCode);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.breedCountry.update).toHaveBeenCalledWith({
        where: { id: mockAssociation.id },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if association does not exist', async () => {
      const breedId = 'breed-123';
      const countryCode = 'FR';

      mockPrismaService.breedCountry.findFirst.mockResolvedValue(null);

      await expect(service.unlink(breedId, countryCode)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active associations by default', async () => {
      const mockAssociations = [
        {
          id: 'assoc-1',
          breedId: 'breed-1',
          countryCode: 'FR',
          isActive: true,
          breed: {
            id: 'breed-1',
            code: 'lacaune',
            nameFr: 'Lacaune',
            nameEn: 'Lacaune',
            nameAr: 'لاكون',
            deletedAt: null,
          },
          country: {
            code: 'FR',
            nameFr: 'France',
            nameEn: 'France',
            nameAr: 'فرنسا',
          },
        },
      ];

      mockPrismaService.breedCountry.findMany.mockResolvedValue(mockAssociations);

      const result = await service.findAll(false);

      expect(result).toEqual(mockAssociations);
      expect(mockPrismaService.breedCountry.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
    });

    it('should include inactive associations when requested', async () => {
      mockPrismaService.breedCountry.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(mockPrismaService.breedCountry.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
    });
  });
});
