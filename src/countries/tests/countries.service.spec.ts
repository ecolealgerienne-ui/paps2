import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CountriesService } from '../countries.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CountriesService', () => {
  let service: CountriesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    country: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      code: 'DZ',
      nameFr: 'Algérie',
      nameEn: 'Algeria',
      nameAr: 'الجزائر',
      region: 'Africa',
      isActive: true,
    };

    const createdCountry = {
      code: 'DZ',
      nameFr: 'Algérie',
      nameEn: 'Algeria',
      nameAr: 'الجزائر',
      region: 'Africa',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a country successfully', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(null);
      mockPrismaService.country.create.mockResolvedValue(createdCountry);

      const result = await service.create(createDto);

      expect(result).toEqual(createdCountry);
      expect(mockPrismaService.country.findUnique).toHaveBeenCalledWith({
        where: { code: 'DZ' },
      });
      expect(mockPrismaService.country.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          code: 'DZ',
        },
      });
    });

    it('should throw ConflictException if country code already exists', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(createdCountry);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Country with code "DZ" already exists',
      );
    });

    it('should convert code to uppercase', async () => {
      const lowerCaseDto = { ...createDto, code: 'dz' };
      mockPrismaService.country.findUnique.mockResolvedValue(null);
      mockPrismaService.country.create.mockResolvedValue(createdCountry);

      await service.create(lowerCaseDto);

      expect(mockPrismaService.country.findUnique).toHaveBeenCalledWith({
        where: { code: 'DZ' },
      });
      expect(mockPrismaService.country.create).toHaveBeenCalledWith({
        data: {
          ...lowerCaseDto,
          code: 'DZ',
        },
      });
    });
  });

  describe('findAll', () => {
    const mockCountries = [
      {
        code: 'DZ',
        nameFr: 'Algérie',
        nameEn: 'Algeria',
        nameAr: 'الجزائر',
        region: 'Africa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'FR',
        nameFr: 'France',
        nameEn: 'France',
        nameAr: 'فرنسا',
        region: 'Europe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all active countries by default', async () => {
      mockPrismaService.country.findMany.mockResolvedValue(mockCountries);

      const result = await service.findAll();

      expect(result).toEqual(mockCountries);
      expect(mockPrismaService.country.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ region: 'asc' }, { nameFr: 'asc' }],
      });
    });

    it('should filter by region', async () => {
      const africaCountries = [mockCountries[0]];
      mockPrismaService.country.findMany.mockResolvedValue(africaCountries);

      const result = await service.findAll('Africa');

      expect(result).toEqual(africaCountries);
      expect(mockPrismaService.country.findMany).toHaveBeenCalledWith({
        where: { isActive: true, region: 'Africa' },
        orderBy: [{ region: 'asc' }, { nameFr: 'asc' }],
      });
    });

    it('should include inactive countries when requested', async () => {
      mockPrismaService.country.findMany.mockResolvedValue(mockCountries);

      const result = await service.findAll(undefined, true);

      expect(result).toEqual(mockCountries);
      expect(mockPrismaService.country.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ region: 'asc' }, { nameFr: 'asc' }],
      });
    });
  });

  describe('findByRegion', () => {
    const africaCountries = [
      {
        code: 'DZ',
        nameFr: 'Algérie',
        nameEn: 'Algeria',
        nameAr: 'الجزائر',
        region: 'Africa',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return countries in specified region', async () => {
      mockPrismaService.country.findMany.mockResolvedValue(africaCountries);

      const result = await service.findByRegion('Africa');

      expect(result).toEqual(africaCountries);
      expect(mockPrismaService.country.findMany).toHaveBeenCalledWith({
        where: { region: 'Africa', isActive: true },
        orderBy: { nameFr: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    const mockCountry = {
      code: 'DZ',
      nameFr: 'Algérie',
      nameEn: 'Algeria',
      nameAr: 'الجزائر',
      region: 'Africa',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a country by code', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);

      const result = await service.findOne('DZ');

      expect(result).toEqual(mockCountry);
      expect(mockPrismaService.country.findUnique).toHaveBeenCalledWith({
        where: { code: 'DZ' },
      });
    });

    it('should convert code to uppercase', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);

      await service.findOne('dz');

      expect(mockPrismaService.country.findUnique).toHaveBeenCalledWith({
        where: { code: 'DZ' },
      });
    });

    it('should throw NotFoundException if country not found', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      await expect(service.findOne('XX')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('XX')).rejects.toThrow(
        'Country with code "XX" not found',
      );
    });
  });

  describe('update', () => {
    const mockCountry = {
      code: 'DZ',
      nameFr: 'Algérie',
      nameEn: 'Algeria',
      nameAr: 'الجزائر',
      region: 'Africa',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateDto = {
      nameFr: 'Algérie (modifié)',
      region: 'North Africa',
    };

    it('should update a country', async () => {
      const updatedCountry = { ...mockCountry, ...updateDto };
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.country.update.mockResolvedValue(updatedCountry);

      const result = await service.update('DZ', updateDto);

      expect(result).toEqual(updatedCountry);
      expect(mockPrismaService.country.update).toHaveBeenCalledWith({
        where: { code: 'DZ' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if country not found', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      await expect(service.update('XX', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleActive', () => {
    const mockCountry = {
      code: 'DZ',
      nameFr: 'Algérie',
      nameEn: 'Algeria',
      nameAr: 'الجزائر',
      region: 'Africa',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should toggle country active status', async () => {
      const toggledCountry = { ...mockCountry, isActive: false };
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.country.update.mockResolvedValue(toggledCountry);

      const result = await service.toggleActive('DZ', false);

      expect(result).toEqual(toggledCountry);
      expect(mockPrismaService.country.update).toHaveBeenCalledWith({
        where: { code: 'DZ' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if country not found', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      await expect(service.toggleActive('XX', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const mockCountry = {
      code: 'DZ',
      nameFr: 'Algérie',
      nameEn: 'Algeria',
      nameAr: 'الجزائر',
      region: 'Africa',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should delete a country if not used', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.country.delete.mockResolvedValue(mockCountry);

      const result = await service.remove('DZ');

      expect(result).toEqual(mockCountry);
      expect(mockPrismaService.country.delete).toHaveBeenCalledWith({
        where: { code: 'DZ' },
      });
    });

    it('should throw NotFoundException if country not found', async () => {
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      await expect(service.remove('XX')).rejects.toThrow(NotFoundException);
    });

    // Note: Test for ConflictException will be activated after BLOC 3
    // when liaison tables are created (checkUsage will return > 0)
  });

  describe('getRegions', () => {
    const mockRegions = [
      { region: 'Africa' },
      { region: 'Europe' },
      { region: 'Asia' },
      { region: 'Americas' },
      { region: 'Oceania' },
    ];

    it('should return list of distinct regions', async () => {
      mockPrismaService.country.findMany.mockResolvedValue(mockRegions);

      const result = await service.getRegions();

      expect(result).toEqual([
        'Africa',
        'Europe',
        'Asia',
        'Americas',
        'Oceania',
      ]);
      expect(mockPrismaService.country.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: { region: true },
        distinct: ['region'],
        orderBy: { region: 'asc' },
      });
    });

    it('should filter out null regions', async () => {
      const regionsWithNull = [...mockRegions, { region: null }];
      mockPrismaService.country.findMany.mockResolvedValue(regionsWithNull);

      const result = await service.getRegions();

      expect(result).toEqual([
        'Africa',
        'Europe',
        'Asia',
        'Americas',
        'Oceania',
      ]);
      expect(result).not.toContain(null);
    });
  });
});
