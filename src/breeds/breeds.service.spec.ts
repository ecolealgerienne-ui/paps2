import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BreedsService } from './breeds.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';

describe('BreedsService - PHASE_12', () => {
  let service: BreedsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    breed: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
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
        BreedsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BreedsService>(BreedsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock the logger
    (service as any).logger = mockLogger;

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a breed with code field', async () => {
      const dto = {
        id: 'breed-123',
        code: 'lacaune',
        speciesId: 'species-123',
        nameFr: 'Lacaune',
        nameEn: 'Lacaune',
        nameAr: 'لاكون',
        description: 'Race ovine française',
        displayOrder: 1,
        isActive: true,
      };

      const mockBreed = {
        ...dto,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.breed.create.mockResolvedValue(mockBreed);

      const result = await service.create(dto);

      expect(result).toEqual(mockBreed);
      expect(mockPrismaService.breed.create).toHaveBeenCalledWith({
        data: {
          code: dto.code,
          speciesId: dto.speciesId,
          nameFr: dto.nameFr,
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          description: dto.description,
          displayOrder: dto.displayOrder,
          isActive: dto.isActive,
        },
      });
    });

    it('should use default values for optional fields', async () => {
      const dto = {
        id: 'breed-123',
        code: 'holstein',
        speciesId: 'species-123',
        nameFr: 'Holstein',
        nameEn: 'Holstein',
        nameAr: 'هولشتاين',
      };

      const mockBreed = {
        ...dto,
        description: null,
        displayOrder: 0,
        isActive: true,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.breed.create.mockResolvedValue(mockBreed);

      await service.create(dto);

      expect(mockPrismaService.breed.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          displayOrder: 0,
          isActive: true,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all active breeds excluding soft deleted', async () => {
      const mockBreeds = [
        {
          id: 'breed-1',
          code: 'lacaune',
          speciesId: 'species-1',
          nameFr: 'Lacaune',
          nameEn: 'Lacaune',
          nameAr: 'لاكون',
          description: null,
          displayOrder: 1,
          isActive: true,
          version: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.breed.findMany.mockResolvedValue(mockBreeds);

      const result = await service.findAll();

      expect(result).toEqual(mockBreeds);
      expect(mockPrismaService.breed.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          deletedAt: null,
        },
        orderBy: {
          displayOrder: 'asc',
        },
        select: expect.objectContaining({
          id: true,
          code: true,
          version: true,
          deletedAt: true,
        }),
      });
    });

    it('should filter by speciesId when provided', async () => {
      const speciesId = 'species-123';
      mockPrismaService.breed.findMany.mockResolvedValue([]);

      await service.findAll(speciesId);

      expect(mockPrismaService.breed.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          deletedAt: null,
          speciesId: speciesId,
        },
        orderBy: {
          displayOrder: 'asc',
        },
        select: expect.any(Object),
      });
    });

    it('should include soft deleted breeds when includeDeleted is true', async () => {
      mockPrismaService.breed.findMany.mockResolvedValue([]);

      await service.findAll(undefined, true);

      expect(mockPrismaService.breed.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          displayOrder: 'asc',
        },
        select: expect.any(Object),
      });
    });
  });

  describe('findBySpecies', () => {
    it('should find breeds by species using composite index', async () => {
      const speciesId = 'species-123';
      const mockBreeds = [
        {
          id: 'breed-1',
          code: 'lacaune',
          speciesId: speciesId,
          nameFr: 'Lacaune',
          nameEn: 'Lacaune',
          nameAr: 'لاكون',
          isActive: true,
          deletedAt: null,
          version: 1,
        },
      ];

      mockPrismaService.breed.findMany.mockResolvedValue(mockBreeds);

      const result = await service.findBySpecies(speciesId);

      expect(result).toEqual(mockBreeds);
      expect(mockPrismaService.breed.findMany).toHaveBeenCalledWith({
        where: {
          speciesId: speciesId,
          deletedAt: null,
          isActive: true,
        },
        orderBy: {
          displayOrder: 'asc',
        },
      });
    });

    it('should include inactive breeds when activeOnly is false', async () => {
      const speciesId = 'species-123';
      mockPrismaService.breed.findMany.mockResolvedValue([]);

      await service.findBySpecies(speciesId, false);

      expect(mockPrismaService.breed.findMany).toHaveBeenCalledWith({
        where: {
          speciesId: speciesId,
          deletedAt: null,
        },
        orderBy: {
          displayOrder: 'asc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a breed by id excluding soft deleted', async () => {
      const breedId = 'breed-123';
      const mockBreed = {
        id: breedId,
        code: 'lacaune',
        speciesId: 'species-123',
        nameFr: 'Lacaune',
        nameEn: 'Lacaune',
        nameAr: 'لاكون',
        isActive: true,
        deletedAt: null,
        version: 1,
      };

      mockPrismaService.breed.findFirst.mockResolvedValue(mockBreed);

      const result = await service.findOne(breedId);

      expect(result).toEqual(mockBreed);
      expect(mockPrismaService.breed.findFirst).toHaveBeenCalledWith({
        where: {
          id: breedId,
          deletedAt: null,
        },
      });
    });

    it('should throw NotFoundException if breed not found', async () => {
      const breedId = 'non-existent-breed';
      mockPrismaService.breed.findFirst.mockResolvedValue(null);

      await expect(service.findOne(breedId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(breedId)).rejects.toThrow(
        `Breed with ID ${breedId} not found`,
      );
    });

    it('should throw NotFoundException if breed is soft deleted', async () => {
      const breedId = 'deleted-breed';
      mockPrismaService.breed.findFirst.mockResolvedValue(null);

      await expect(service.findOne(breedId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a breed and increment version', async () => {
      const breedId = 'breed-123';
      const dto = {
        nameFr: 'Lacaune Mise à jour',
        displayOrder: 2,
      };

      const existingBreed = {
        id: breedId,
        code: 'lacaune',
        speciesId: 'species-123',
        nameFr: 'Lacaune',
        version: 1,
        deletedAt: null,
      };

      const updatedBreed = {
        ...existingBreed,
        ...dto,
        version: 2,
        updatedAt: new Date(),
      };

      mockPrismaService.breed.findFirst.mockResolvedValue(existingBreed);
      mockPrismaService.breed.update.mockResolvedValue(updatedBreed);

      const result = await service.update(breedId, dto);

      expect(result).toEqual(updatedBreed);
      expect(mockPrismaService.breed.update).toHaveBeenCalledWith({
        where: { id: breedId },
        data: expect.objectContaining({
          nameFr: dto.nameFr,
          displayOrder: dto.displayOrder,
          version: { increment: 1 },
        }),
      });
    });

    it('should implement optimistic locking with version check', async () => {
      const breedId = 'breed-123';
      const dto = {
        nameFr: 'Updated Name',
      };
      const currentVersion = 1;

      const existingBreed = {
        id: breedId,
        version: 2, // Version has changed
        deletedAt: null,
      };

      mockPrismaService.breed.findFirst.mockResolvedValue(existingBreed);

      await expect(service.update(breedId, dto, currentVersion)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update(breedId, dto, currentVersion)).rejects.toThrow(
        `Version mismatch: expected ${currentVersion}, got ${existingBreed.version}`,
      );
    });

    it('should allow update without version check when version not provided', async () => {
      const breedId = 'breed-123';
      const dto = {
        nameFr: 'Updated Name',
      };

      const existingBreed = {
        id: breedId,
        version: 5,
        deletedAt: null,
      };

      const updatedBreed = {
        ...existingBreed,
        ...dto,
        version: 6,
      };

      mockPrismaService.breed.findFirst.mockResolvedValue(existingBreed);
      mockPrismaService.breed.update.mockResolvedValue(updatedBreed);

      const result = await service.update(breedId, dto);

      expect(result).toEqual(updatedBreed);
    });
  });

  describe('remove', () => {
    it('should soft delete a breed instead of hard delete', async () => {
      const breedId = 'breed-123';
      const existingBreed = {
        id: breedId,
        code: 'lacaune',
        nameFr: 'Lacaune',
        version: 1,
        deletedAt: null,
      };

      const softDeletedBreed = {
        ...existingBreed,
        deletedAt: new Date(),
        version: 2,
      };

      mockPrismaService.breed.findFirst.mockResolvedValue(existingBreed);
      mockPrismaService.breed.update.mockResolvedValue(softDeletedBreed);

      const result = await service.remove(breedId);

      expect(result).toEqual(softDeletedBreed);
      expect(mockPrismaService.breed.update).toHaveBeenCalledWith({
        where: { id: breedId },
        data: {
          deletedAt: expect.any(Date),
          version: { increment: 1 },
        },
      });
    });

    it('should throw NotFoundException if breed does not exist', async () => {
      const breedId = 'non-existent';
      mockPrismaService.breed.findFirst.mockResolvedValue(null);

      await expect(service.remove(breedId)).rejects.toThrow(NotFoundException);
    });
  });
});
