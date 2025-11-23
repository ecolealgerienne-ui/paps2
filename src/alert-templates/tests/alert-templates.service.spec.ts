import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AlertTemplatesService } from '../alert-templates.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertCategory } from '../types/alert-category.enum';
import { AlertPriority } from '../types/alert-priority.enum';

describe('AlertTemplatesService', () => {
  let service: AlertTemplatesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    alertTemplate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertTemplatesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AlertTemplatesService>(AlertTemplatesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      code: 'vaccination_due',
      nameFr: 'Vaccination à venir',
      nameEn: 'Vaccination Due',
      nameAr: 'التطعيم المستحق',
      category: AlertCategory.vaccination,
      priority: AlertPriority.high,
    };

    it('should create a new template', async () => {
      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(null);
      mockPrismaService.alertTemplate.create.mockResolvedValue({
        id: '1',
        ...createDto,
        descriptionFr: null,
        descriptionEn: null,
        descriptionAr: null,
        isActive: true,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.code).toBe('vaccination_due');
      expect(result.version).toBe(1);
      expect(mockPrismaService.alertTemplate.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if code already exists', async () => {
      mockPrismaService.alertTemplate.findUnique.mockResolvedValue({
        id: '1',
        ...createDto,
        descriptionFr: null,
        descriptionEn: null,
        descriptionAr: null,
        isActive: true,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.alertTemplate.create).not.toHaveBeenCalled();
    });

    it('should restore soft-deleted template with same code', async () => {
      const deletedTemplate = {
        id: '1',
        ...createDto,
        descriptionFr: null,
        descriptionEn: null,
        descriptionAr: null,
        isActive: true,
        version: 1,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(deletedTemplate);
      mockPrismaService.alertTemplate.update.mockResolvedValue({
        ...deletedTemplate,
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
    const templates = [
      {
        id: '1',
        code: 'vaccination_due',
        nameFr: 'Vaccination à venir',
        nameEn: 'Vaccination Due',
        nameAr: 'التطعيم المستحق',
        descriptionFr: null,
        descriptionEn: null,
        descriptionAr: null,
        category: AlertCategory.vaccination,
        priority: AlertPriority.high,
        isActive: true,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all non-deleted templates', async () => {
      mockPrismaService.alertTemplate.findMany.mockResolvedValue(templates);

      const result = await service.findAll();

      expect(result).toEqual(templates);
      expect(mockPrismaService.alertTemplate.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { nameFr: 'asc' },
      });
    });

    it('should filter by category', async () => {
      mockPrismaService.alertTemplate.findMany.mockResolvedValue(templates);

      await service.findAll({ category: AlertCategory.vaccination });

      expect(mockPrismaService.alertTemplate.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, category: AlertCategory.vaccination },
        orderBy: { nameFr: 'asc' },
      });
    });

    it('should filter by priority', async () => {
      mockPrismaService.alertTemplate.findMany.mockResolvedValue(templates);

      await service.findAll({ priority: AlertPriority.high });

      expect(mockPrismaService.alertTemplate.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, priority: AlertPriority.high },
        orderBy: { nameFr: 'asc' },
      });
    });

    it('should include deleted templates when requested', async () => {
      mockPrismaService.alertTemplate.findMany.mockResolvedValue([]);

      await service.findAll({ includeDeleted: true });

      expect(mockPrismaService.alertTemplate.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a template by id', async () => {
      const template = {
        id: '1',
        code: 'vaccination_due',
        nameFr: 'Vaccination à venir',
        nameEn: 'Vaccination Due',
        nameAr: 'التطعيم المستحق',
        descriptionFr: null,
        descriptionEn: null,
        descriptionAr: null,
        category: AlertCategory.vaccination,
        priority: AlertPriority.high,
        isActive: true,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(template);

      const result = await service.findOne('1');

      expect(result).toEqual(template);
    });

    it('should throw NotFoundException if template not found', async () => {
      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if template is soft-deleted', async () => {
      mockPrismaService.alertTemplate.findUnique.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      });

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a template by code', async () => {
      const template = {
        id: '1',
        code: 'vaccination_due',
        nameFr: 'Vaccination à venir',
        nameEn: 'Vaccination Due',
        nameAr: 'التطعيم المستحق',
        category: AlertCategory.vaccination,
        priority: AlertPriority.high,
        deletedAt: null,
      };

      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(template);

      const result = await service.findByCode('vaccination_due');

      expect(result.code).toBe('vaccination_due');
    });

    it('should throw NotFoundException if code not found', async () => {
      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCategory', () => {
    it('should return templates of specified category', async () => {
      const templates = [
        {
          id: '1',
          category: AlertCategory.vaccination,
          deletedAt: null,
        },
      ];

      mockPrismaService.alertTemplate.findMany.mockResolvedValue(templates);

      const result = await service.findByCategory(AlertCategory.vaccination);

      expect(result).toEqual(templates);
      expect(mockPrismaService.alertTemplate.findMany).toHaveBeenCalledWith({
        where: { category: AlertCategory.vaccination, deletedAt: null },
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('findByPriority', () => {
    it('should return templates of specified priority', async () => {
      const templates = [
        {
          id: '1',
          priority: AlertPriority.high,
          deletedAt: null,
        },
      ];

      mockPrismaService.alertTemplate.findMany.mockResolvedValue(templates);

      const result = await service.findByPriority(AlertPriority.high);

      expect(result).toEqual(templates);
      expect(mockPrismaService.alertTemplate.findMany).toHaveBeenCalledWith({
        where: { priority: AlertPriority.high, deletedAt: null },
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      nameFr: 'Vaccination à venir (modifiée)',
      version: 1,
    };

    it('should update a template', async () => {
      const existing = {
        id: '1',
        code: 'vaccination_due',
        version: 1,
        deletedAt: null,
      };

      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(existing);
      mockPrismaService.alertTemplate.update.mockResolvedValue({
        ...existing,
        ...updateDto,
        version: 2,
      });

      const result = await service.update('1', updateDto);

      expect(result.version).toBe(2);
      expect(mockPrismaService.alertTemplate.update).toHaveBeenCalledWith({
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

      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(existing);

      await expect(service.update('1', { version: 1 })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete a template', async () => {
      const existing = {
        id: '1',
        code: 'vaccination_due',
        version: 1,
        deletedAt: null,
      };

      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(existing);
      mockPrismaService.alertTemplate.update.mockResolvedValue({
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
    it('should restore a soft-deleted template', async () => {
      const deletedTemplate = {
        id: '1',
        code: 'vaccination_due',
        version: 2,
        deletedAt: new Date(),
      };

      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(deletedTemplate);
      mockPrismaService.alertTemplate.update.mockResolvedValue({
        ...deletedTemplate,
        deletedAt: null,
        version: 3,
      });

      const result = await service.restore('1');

      expect(result.deletedAt).toBeNull();
      expect(result.version).toBe(3);
    });

    it('should throw NotFoundException if template does not exist', async () => {
      mockPrismaService.alertTemplate.findUnique.mockResolvedValue(null);

      await expect(service.restore('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if template is not deleted', async () => {
      mockPrismaService.alertTemplate.findUnique.mockResolvedValue({
        id: '1',
        deletedAt: null,
      });

      await expect(service.restore('1')).rejects.toThrow(ConflictException);
    });
  });
});
