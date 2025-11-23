import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VaccinesGlobalService } from '../vaccines-global.service';
import { PrismaService } from '../../prisma/prisma.service';
import { VaccineTargetDisease } from '../dto/create-vaccine-global.dto';

describe('VaccinesGlobalService', () => {
  let service: VaccinesGlobalService;
  let prisma: PrismaService;

  const mockPrismaService = {
    vaccineGlobal: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaccinesGlobalService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VaccinesGlobalService>(VaccinesGlobalService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      code: 'brucellose_b19',
      nameFr: 'Brucellosis B19',
      nameEn: 'Brucellosis B19',
      nameAr: 'بروسيلا B19',
      targetDisease: VaccineTargetDisease.BRUCELLOSIS,
      laboratoire: 'Ceva',
      dureeImmunite: 365,
    };

    const createdVaccine = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...createDto,
      description: null,
      numeroAMM: null,
      dosageRecommande: null,
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a vaccine successfully', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(null);
      mockPrismaService.vaccineGlobal.create.mockResolvedValue(createdVaccine);

      const result = await service.create(createDto);

      expect(result).toEqual(createdVaccine);
      expect(mockPrismaService.vaccineGlobal.findUnique).toHaveBeenCalledWith({
        where: { code: 'brucellose_b19' },
      });
      expect(mockPrismaService.vaccineGlobal.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if code already exists', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(
        createdVaccine,
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Vaccine with code "brucellose_b19" already exists',
      );
    });
  });

  describe('findAll', () => {
    const mockVaccines = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        code: 'brucellose_b19',
        nameFr: 'Brucellosis B19',
        nameEn: 'Brucellosis B19',
        nameAr: 'بروسيلا B19',
        description: null,
        targetDisease: 'brucellosis',
        laboratoire: 'Ceva',
        numeroAMM: null,
        dosageRecommande: null,
        dureeImmunite: 365,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        code: 'fievre_aphteuse',
        nameFr: 'Fièvre Aphteuse',
        nameEn: 'Foot and Mouth Disease',
        nameAr: 'الحمى القلاعية',
        description: null,
        targetDisease: 'foot_and_mouth',
        laboratoire: 'Merial',
        numeroAMM: null,
        dosageRecommande: null,
        dureeImmunite: 180,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all non-deleted vaccines by default', async () => {
      mockPrismaService.vaccineGlobal.findMany.mockResolvedValue(mockVaccines);

      const result = await service.findAll();

      expect(result).toEqual(mockVaccines);
      expect(mockPrismaService.vaccineGlobal.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: [{ targetDisease: 'asc' }, { nameFr: 'asc' }],
      });
    });

    it('should filter by target disease', async () => {
      const brucellosisVaccines = [mockVaccines[0]];
      mockPrismaService.vaccineGlobal.findMany.mockResolvedValue(
        brucellosisVaccines,
      );

      const result = await service.findAll({
        targetDisease: VaccineTargetDisease.BRUCELLOSIS,
      });

      expect(result).toEqual(brucellosisVaccines);
      expect(mockPrismaService.vaccineGlobal.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          targetDisease: VaccineTargetDisease.BRUCELLOSIS,
        },
        orderBy: [{ targetDisease: 'asc' }, { nameFr: 'asc' }],
      });
    });

    it('should include deleted vaccines when requested', async () => {
      mockPrismaService.vaccineGlobal.findMany.mockResolvedValue(mockVaccines);

      const result = await service.findAll({ includeDeleted: true });

      expect(result).toEqual(mockVaccines);
      expect(mockPrismaService.vaccineGlobal.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ targetDisease: 'asc' }, { nameFr: 'asc' }],
      });
    });
  });

  describe('findByTargetDisease', () => {
    const mockVaccines = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        code: 'brucellose_b19',
        nameFr: 'Brucellosis B19',
        nameEn: 'Brucellosis B19',
        nameAr: 'بروسيلا B19',
        description: null,
        targetDisease: 'brucellosis',
        laboratoire: 'Ceva',
        numeroAMM: null,
        dosageRecommande: null,
        dureeImmunite: 365,
        version: 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return vaccines for specified disease', async () => {
      mockPrismaService.vaccineGlobal.findMany.mockResolvedValue(mockVaccines);

      const result = await service.findByTargetDisease(
        VaccineTargetDisease.BRUCELLOSIS,
      );

      expect(result).toEqual(mockVaccines);
      expect(mockPrismaService.vaccineGlobal.findMany).toHaveBeenCalledWith({
        where: {
          targetDisease: VaccineTargetDisease.BRUCELLOSIS,
          deletedAt: null,
        },
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    const mockVaccine = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      code: 'brucellose_b19',
      nameFr: 'Brucellosis B19',
      nameEn: 'Brucellosis B19',
      nameAr: 'بروسيلا B19',
      description: null,
      targetDisease: 'brucellosis',
      laboratoire: 'Ceva',
      numeroAMM: null,
      dosageRecommande: null,
      dureeImmunite: 365,
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a vaccine by ID', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(
        mockVaccine,
      );

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockVaccine);
      expect(mockPrismaService.vaccineGlobal.findUnique).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
    });

    it('should throw NotFoundException if vaccine not found', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if vaccine is soft deleted', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue({
        ...mockVaccine,
        deletedAt: new Date(),
      });

      await expect(
        service.findOne('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    const mockVaccine = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      code: 'brucellose_b19',
      nameFr: 'Brucellosis B19',
      nameEn: 'Brucellosis B19',
      nameAr: 'بروسيلا B19',
      description: null,
      targetDisease: 'brucellosis',
      laboratoire: 'Ceva',
      numeroAMM: null,
      dosageRecommande: null,
      dureeImmunite: 365,
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a vaccine by code', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(
        mockVaccine,
      );

      const result = await service.findByCode('brucellose_b19');

      expect(result).toEqual(mockVaccine);
      expect(mockPrismaService.vaccineGlobal.findUnique).toHaveBeenCalledWith({
        where: { code: 'brucellose_b19' },
      });
    });

    it('should throw NotFoundException if vaccine not found', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(null);

      await expect(service.findByCode('unknown_code')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const mockVaccine = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      code: 'brucellose_b19',
      nameFr: 'Brucellosis B19',
      nameEn: 'Brucellosis B19',
      nameAr: 'بروسيلا B19',
      description: null,
      targetDisease: 'brucellosis',
      laboratoire: 'Ceva',
      numeroAMM: null,
      dosageRecommande: null,
      dureeImmunite: 365,
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateDto = {
      nameFr: 'Brucellosis B19 (modifié)',
      laboratoire: 'Ceva Santé Animale',
    };

    it('should update a vaccine', async () => {
      const updatedVaccine = { ...mockVaccine, ...updateDto, version: 2 };
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(
        mockVaccine,
      );
      mockPrismaService.vaccineGlobal.update.mockResolvedValue(
        updatedVaccine,
      );

      const result = await service.update(
        '123e4567-e89b-12d3-a456-426614174000',
        updateDto,
      );

      expect(result).toEqual(updatedVaccine);
      expect(mockPrismaService.vaccineGlobal.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: {
          ...updateDto,
          version: { increment: 1 },
        },
      });
    });

    it('should throw NotFoundException if vaccine not found', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(null);

      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on version mismatch', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(
        mockVaccine,
      );

      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', updateDto, 5),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174000', updateDto, 5),
      ).rejects.toThrow('Version mismatch: expected 5, got 1');
    });
  });

  describe('remove', () => {
    const mockVaccine = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      code: 'brucellose_b19',
      nameFr: 'Brucellosis B19',
      nameEn: 'Brucellosis B19',
      nameAr: 'بروسيلا B19',
      description: null,
      targetDisease: 'brucellosis',
      laboratoire: 'Ceva',
      numeroAMM: null,
      dosageRecommande: null,
      dureeImmunite: 365,
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should soft delete a vaccine if not used', async () => {
      const deletedVaccine = { ...mockVaccine, deletedAt: new Date() };
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(
        mockVaccine,
      );
      mockPrismaService.vaccineGlobal.update.mockResolvedValue(
        deletedVaccine,
      );

      const result = await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(result.deletedAt).toBeDefined();
      expect(mockPrismaService.vaccineGlobal.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException if vaccine not found', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(NotFoundException);
    });

    // Note: Test for ConflictException will be activated after BLOC 3 & BLOC 4
    // when relation tables are created (checkUsage will return > 0)
  });

  describe('getTargetDiseases', () => {
    const mockDiseases = [
      { targetDisease: 'brucellosis' },
      { targetDisease: 'foot_and_mouth' },
      { targetDisease: 'ppr' },
    ];

    it('should return list of distinct target diseases', async () => {
      mockPrismaService.vaccineGlobal.findMany.mockResolvedValue(
        mockDiseases,
      );

      const result = await service.getTargetDiseases();

      expect(result).toEqual(['brucellosis', 'foot_and_mouth', 'ppr']);
      expect(mockPrismaService.vaccineGlobal.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        select: { targetDisease: true },
        distinct: ['targetDisease'],
        orderBy: { targetDisease: 'asc' },
      });
    });
  });

  describe('restore', () => {
    const mockVaccine = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      code: 'brucellose_b19',
      nameFr: 'Brucellosis B19',
      nameEn: 'Brucellosis B19',
      nameAr: 'بروسيلا B19',
      description: null,
      targetDisease: 'brucellosis',
      laboratoire: 'Ceva',
      numeroAMM: null,
      dosageRecommande: null,
      dureeImmunite: 365,
      version: 1,
      deletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should restore a soft deleted vaccine', async () => {
      const restoredVaccine = { ...mockVaccine, deletedAt: null };
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(
        mockVaccine,
      );
      mockPrismaService.vaccineGlobal.update.mockResolvedValue(
        restoredVaccine,
      );

      const result = await service.restore('123e4567-e89b-12d3-a456-426614174000');

      expect(result.deletedAt).toBeNull();
      expect(mockPrismaService.vaccineGlobal.update).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        data: {
          deletedAt: null,
        },
      });
    });

    it('should throw NotFoundException if vaccine not found', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue(null);

      await expect(
        service.restore('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if vaccine is not deleted', async () => {
      mockPrismaService.vaccineGlobal.findUnique.mockResolvedValue({
        ...mockVaccine,
        deletedAt: null,
      });

      await expect(
        service.restore('123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
