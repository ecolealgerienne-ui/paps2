import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GlobalMedicalProductsService } from '../global-medical-products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MedicalProductType } from '../types/medical-product-type.enum';

describe('GlobalMedicalProductsService', () => {
  let service: GlobalMedicalProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    globalMedicalProduct: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalMedicalProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GlobalMedicalProductsService>(GlobalMedicalProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      code: 'amoxicilline_500',
      nameFr: 'Amoxicilline 500mg',
      nameEn: 'Amoxicillin 500mg',
      nameAr: 'أموكسيسيلين 500 ملغ',
      description: 'Antibiotic for bacterial infections',
      type: MedicalProductType.antibiotic,
      principeActif: 'Amoxicilline',
      laboratoire: 'Pfizer',
    };

    it('should create a new product', async () => {
      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(null);
      mockPrismaService.globalMedicalProduct.create.mockResolvedValue({
        id: '1',
        ...createDto,
        numeroAMM: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.code).toBe('amoxicilline_500');
      expect(result.version).toBe(1);
      expect(mockPrismaService.globalMedicalProduct.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if code already exists', async () => {
      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue({
        id: '1',
        ...createDto,
        numeroAMM: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.globalMedicalProduct.create).not.toHaveBeenCalled();
    });

    it('should restore soft-deleted product with same code', async () => {
      const deletedProduct = {
        id: '1',
        ...createDto,
        numeroAMM: null,
        version: 1,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(deletedProduct);
      mockPrismaService.globalMedicalProduct.update.mockResolvedValue({
        ...deletedProduct,
        deletedAt: null,
        version: 2,
      });

      const result = await service.create(createDto);

      expect(result.id).toBe('1');
      expect(result.deletedAt).toBeNull();
      expect(result.version).toBe(2);
    });
  });

  describe('findAll', () => {
    const products = [
      {
        id: '1',
        code: 'enrofloxacine_100',
        nameFr: 'Enrofloxacine 10%',
        nameEn: 'Enrofloxacin 10%',
        nameAr: 'إنروفلوكساسين 10%',
        description: null,
        type: MedicalProductType.antibiotic,
        principeActif: 'Enrofloxacine',
        laboratoire: 'Ceva',
        numeroAMM: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all non-deleted products', async () => {
      mockPrismaService.globalMedicalProduct.findMany.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(mockPrismaService.globalMedicalProduct.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { nameFr: 'asc' },
      });
    });

    it('should filter by type', async () => {
      mockPrismaService.globalMedicalProduct.findMany.mockResolvedValue(products);

      await service.findAll({ type: MedicalProductType.antibiotic });

      expect(mockPrismaService.globalMedicalProduct.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, type: MedicalProductType.antibiotic },
        orderBy: { nameFr: 'asc' },
      });
    });

    it('should filter by laboratoire (case-insensitive)', async () => {
      mockPrismaService.globalMedicalProduct.findMany.mockResolvedValue(products);

      await service.findAll({ laboratoire: 'Ceva' });

      expect(mockPrismaService.globalMedicalProduct.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          laboratoire: { contains: 'Ceva', mode: 'insensitive' },
        },
        orderBy: { nameFr: 'asc' },
      });
    });

    it('should include deleted products when requested', async () => {
      mockPrismaService.globalMedicalProduct.findMany.mockResolvedValue([]);

      await service.findAll({ includeDeleted: true });

      expect(mockPrismaService.globalMedicalProduct.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = {
        id: '1',
        code: 'enrofloxacine_100',
        nameFr: 'Enrofloxacine 10%',
        nameEn: 'Enrofloxacin 10%',
        nameAr: 'إنروفلوكساسين 10%',
        description: null,
        type: MedicalProductType.antibiotic,
        principeActif: 'Enrofloxacine',
        laboratoire: 'Ceva',
        numeroAMM: null,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(product);

      const result = await service.findOne('1');

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product is soft-deleted', async () => {
      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a product by code', async () => {
      const product = {
        id: '1',
        code: 'enrofloxacine_100',
        nameFr: 'Enrofloxacine 10%',
        type: MedicalProductType.antibiotic,
        deletedAt: null,
      };

      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(product);

      const result = await service.findByCode('enrofloxacine_100');

      expect(result.code).toBe('enrofloxacine_100');
    });

    it('should throw NotFoundException if code not found', async () => {
      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByType', () => {
    it('should return products of specified type', async () => {
      const products = [
        {
          id: '1',
          type: MedicalProductType.antibiotic,
          deletedAt: null,
        },
      ];

      mockPrismaService.globalMedicalProduct.findMany.mockResolvedValue(products);

      const result = await service.findByType(MedicalProductType.antibiotic);

      expect(result).toEqual(products);
      expect(mockPrismaService.globalMedicalProduct.findMany).toHaveBeenCalledWith({
        where: { type: MedicalProductType.antibiotic, deletedAt: null },
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      nameFr: 'Enrofloxacine 10% Modifié',
      version: 1,
    };

    it('should update a product', async () => {
      const existing = {
        id: '1',
        code: 'enrofloxacine_100',
        version: 1,
        deletedAt: null,
      };

      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(existing);
      mockPrismaService.globalMedicalProduct.update.mockResolvedValue({
        ...existing,
        ...updateDto,
        version: 2,
      });

      const result = await service.update('1', updateDto);

      expect(result.version).toBe(2);
      expect(mockPrismaService.globalMedicalProduct.update).toHaveBeenCalledWith({
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

      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(existing);

      await expect(service.update('1', { version: 1 })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const existing = {
        id: '1',
        code: 'enrofloxacine_100',
        version: 1,
        deletedAt: null,
      };

      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(existing);
      mockPrismaService.globalMedicalProduct.update.mockResolvedValue({
        ...existing,
        deletedAt: new Date(),
        version: 2,
      });

      const result = await service.remove('1');

      expect(result.deletedAt).not.toBeNull();
      expect(result.version).toBe(2);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted product', async () => {
      const deletedProduct = {
        id: '1',
        code: 'enrofloxacine_100',
        version: 2,
        deletedAt: new Date(),
      };

      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(deletedProduct);
      mockPrismaService.globalMedicalProduct.update.mockResolvedValue({
        ...deletedProduct,
        deletedAt: null,
        version: 3,
      });

      const result = await service.restore('1');

      expect(result.deletedAt).toBeNull();
      expect(result.version).toBe(3);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue(null);

      await expect(service.restore('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if product is not deleted', async () => {
      mockPrismaService.globalMedicalProduct.findUnique.mockResolvedValue({
        id: '1',
        deletedAt: null,
      });

      await expect(service.restore('1')).rejects.toThrow(ConflictException);
    });
  });
});
