import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AdministrationRoutesService } from '../administration-routes.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdministrationRoutesService', () => {
  let service: AdministrationRoutesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    administrationRoute: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    treatment: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdministrationRoutesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdministrationRoutesService>(AdministrationRoutesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      code: 'oral',
      nameFr: 'Voie orale',
      nameEn: 'Oral route',
      nameAr: 'الطريق الفموي',
      description: 'Medication administered by mouth',
    };

    it('should create a new route', async () => {
      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(null);
      mockPrismaService.administrationRoute.create.mockResolvedValue({
        id: '1',
        ...createDto,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.code).toBe('oral');
      expect(result.version).toBe(1);
      expect(mockPrismaService.administrationRoute.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if code already exists', async () => {
      mockPrismaService.administrationRoute.findUnique.mockResolvedValue({
        id: '1',
        ...createDto,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.administrationRoute.create).not.toHaveBeenCalled();
    });

    it('should restore soft-deleted route with same code', async () => {
      const deletedRoute = {
        id: '1',
        ...createDto,
        version: 1,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(deletedRoute);
      mockPrismaService.administrationRoute.update.mockResolvedValue({
        ...deletedRoute,
        deletedAt: null,
        version: 2,
      });

      const result = await service.create(createDto);

      expect(result.id).toBe('1');
      expect(result.deletedAt).toBeNull();
      expect(result.version).toBe(2);
      expect(mockPrismaService.administrationRoute.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...createDto,
          deletedAt: null,
          version: 2,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted routes', async () => {
      const routes = [
        {
          id: '1',
          code: 'oral',
          nameFr: 'Voie orale',
          nameEn: 'Oral route',
          nameAr: 'الطريق الفموي',
          description: null,
          version: 1,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.administrationRoute.findMany.mockResolvedValue(routes);

      const result = await service.findAll();

      expect(result).toEqual(routes);
      expect(mockPrismaService.administrationRoute.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { code: 'asc' },
      });
    });

    it('should include deleted routes when includeDeleted is true', async () => {
      mockPrismaService.administrationRoute.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(mockPrismaService.administrationRoute.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { code: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a route by id', async () => {
      const route = {
        id: '1',
        code: 'oral',
        nameFr: 'Voie orale',
        nameEn: 'Oral route',
        nameAr: 'الطريق الفموي',
        description: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(route);

      const result = await service.findOne('1');

      expect(result).toEqual(route);
    });

    it('should throw NotFoundException if route not found', async () => {
      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if route is soft-deleted', async () => {
      mockPrismaService.administrationRoute.findUnique.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a route by code', async () => {
      const route = {
        id: '1',
        code: 'oral',
        nameFr: 'Voie orale',
        nameEn: 'Oral route',
        nameAr: 'الطريق الفموي',
        description: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(route);

      const result = await service.findByCode('oral');

      expect(result).toEqual(route);
    });

    it('should throw NotFoundException if code not found', async () => {
      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      nameFr: 'Voie orale modifiée',
      version: 1,
    };

    it('should update a route', async () => {
      const existing = {
        id: '1',
        code: 'oral',
        nameFr: 'Voie orale',
        nameEn: 'Oral route',
        nameAr: 'الطريق الفموي',
        description: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(existing);
      mockPrismaService.administrationRoute.update.mockResolvedValue({
        ...existing,
        ...updateDto,
        version: 2,
      });

      const result = await service.update('1', updateDto);

      expect(result.version).toBe(2);
      expect(mockPrismaService.administrationRoute.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...updateDto,
          version: 2,
        },
      });
    });

    it('should throw ConflictException on version mismatch', async () => {
      const existing = {
        id: '1',
        version: 2,
        deletedAt: null,
      };

      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(existing);

      await expect(service.update('1', { version: 1 })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a route', async () => {
      const existing = {
        id: '1',
        code: 'oral',
        version: 1,
        deletedAt: null,
      };

      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(existing);
      mockPrismaService.treatment.count.mockResolvedValue(0);
      mockPrismaService.administrationRoute.update.mockResolvedValue({
        ...existing,
        deletedAt: new Date(),
        version: 2,
      });

      const result = await service.remove('1');

      expect(result.deletedAt).not.toBeNull();
      expect(result.version).toBe(2);
    });

    it('should throw ConflictException if route is used in treatments', async () => {
      const existing = {
        id: '1',
        deletedAt: null,
      };

      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(existing);
      mockPrismaService.treatment.count.mockResolvedValue(5);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
      expect(mockPrismaService.administrationRoute.update).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted route', async () => {
      const deletedRoute = {
        id: '1',
        code: 'oral',
        version: 2,
        deletedAt: new Date(),
      };

      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(deletedRoute);
      mockPrismaService.administrationRoute.update.mockResolvedValue({
        ...deletedRoute,
        deletedAt: null,
        version: 3,
      });

      const result = await service.restore('1');

      expect(result.deletedAt).toBeNull();
      expect(result.version).toBe(3);
    });

    it('should throw NotFoundException if route does not exist', async () => {
      mockPrismaService.administrationRoute.findUnique.mockResolvedValue(null);

      await expect(service.restore('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if route is not deleted', async () => {
      mockPrismaService.administrationRoute.findUnique.mockResolvedValue({
        id: '1',
        deletedAt: null,
      });

      await expect(service.restore('1')).rejects.toThrow(ConflictException);
    });
  });
});
