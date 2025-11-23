import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesService } from '../species.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SpeciesService', () => {
  let service: SpeciesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    species: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    breed: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeciesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SpeciesService>(SpeciesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new species', async () => {
      const createDto = {
        id: 'bovine',
        nameFr: 'Bovin',
        nameEn: 'Bovine',
        nameAr: 'بقري',
        icon: 'cow',
        displayOrder: 1,
      };

      mockPrismaService.species.findUnique.mockResolvedValue(null);
      mockPrismaService.species.create.mockResolvedValue({
        ...createDto,
        description: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', 'bovine');
      expect(mockPrismaService.species.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'bovine',
          nameFr: 'Bovin',
        }),
      });
    });

    it('should throw ConflictException if species already exists', async () => {
      const createDto = {
        id: 'bovine',
        nameFr: 'Bovin',
        nameEn: 'Bovine',
        nameAr: 'بقري',
        icon: 'cow',
      };

      mockPrismaService.species.findUnique.mockResolvedValue({
        ...createDto,
        displayOrder: 0,
        description: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should restore a soft-deleted species', async () => {
      const createDto = {
        id: 'bovine',
        nameFr: 'Bovin Updated',
        nameEn: 'Bovine',
        nameAr: 'بقري',
        icon: 'cow',
      };

      const existingDeleted = {
        ...createDto,
        displayOrder: 0,
        description: null,
        version: 1,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.species.findUnique.mockResolvedValue(existingDeleted);
      mockPrismaService.species.update.mockResolvedValue({
        ...createDto,
        displayOrder: 0,
        description: null,
        version: 2,
        deletedAt: null,
        createdAt: existingDeleted.createdAt,
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.deletedAt).toBeNull();
      expect(result.version).toBe(2);
    });
  });

  describe('findAll', () => {
    it('should return all active species', async () => {
      const species = [
        { id: 'bovine', nameFr: 'Bovin', deletedAt: null },
        { id: 'ovine', nameFr: 'Ovin', deletedAt: null },
      ];

      mockPrismaService.species.findMany.mockResolvedValue(species);

      const result = await service.findAll(false);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.species.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { nameFr: 'asc' },
      });
    });

    it('should include deleted species when requested', async () => {
      mockPrismaService.species.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(mockPrismaService.species.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('update', () => {
    it('should update species with version increment', async () => {
      const existing = {
        id: 'bovine',
        nameFr: 'Bovin',
        nameEn: 'Bovine',
        nameAr: 'بقري',
        icon: 'cow',
        displayOrder: 0,
        description: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = {
        nameFr: 'Bovin Mis à Jour',
        version: 1,
      };

      mockPrismaService.species.findUnique.mockResolvedValue(existing);
      mockPrismaService.species.update.mockResolvedValue({
        ...existing,
        ...updateDto,
        version: 2,
        updatedAt: new Date(),
      });

      const result = await service.update('bovine', updateDto);

      expect(result.version).toBe(2);
      expect(result.nameFr).toBe('Bovin Mis à Jour');
    });

    it('should throw ConflictException on version mismatch', async () => {
      const existing = {
        id: 'bovine',
        nameFr: 'Bovin',
        version: 2,
        deletedAt: null,
      };

      mockPrismaService.species.findUnique.mockResolvedValue(existing);

      await expect(
        service.update('bovine', { nameFr: 'New', version: 1 })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete species', async () => {
      const existing = {
        id: 'bovine',
        nameFr: 'Bovin',
        version: 1,
        deletedAt: null,
      };

      mockPrismaService.species.findUnique.mockResolvedValue(existing);
      mockPrismaService.breed.count.mockResolvedValue(0);
      mockPrismaService.species.update.mockResolvedValue({
        ...existing,
        version: 2,
        deletedAt: new Date(),
      });

      const result = await service.remove('bovine');

      expect(result.deletedAt).not.toBeNull();
      expect(result.version).toBe(2);
    });

    it('should throw ConflictException if species has active breeds', async () => {
      mockPrismaService.species.findUnique.mockResolvedValue({
        id: 'bovine',
        deletedAt: null,
      });
      mockPrismaService.breed.count.mockResolvedValue(5);

      await expect(service.remove('bovine')).rejects.toThrow(ConflictException);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted species', async () => {
      const deleted = {
        id: 'bovine',
        nameFr: 'Bovin',
        version: 1,
        deletedAt: new Date(),
      };

      mockPrismaService.species.findUnique.mockResolvedValue(deleted);
      mockPrismaService.species.update.mockResolvedValue({
        ...deleted,
        version: 2,
        deletedAt: null,
      });

      const result = await service.restore('bovine');

      expect(result.deletedAt).toBeNull();
      expect(result.version).toBe(2);
    });

    it('should throw NotFoundException if species does not exist', async () => {
      mockPrismaService.species.findUnique.mockResolvedValue(null);

      await expect(service.restore('bovine')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if species is not deleted', async () => {
      mockPrismaService.species.findUnique.mockResolvedValue({
        id: 'bovine',
        deletedAt: null,
      });

      await expect(service.restore('bovine')).rejects.toThrow(ConflictException);
    });
  });
});
