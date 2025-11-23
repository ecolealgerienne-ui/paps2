import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CampaignCountriesService } from './campaign-countries.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/utils/logger.service';

describe('CampaignCountriesService - PHASE_19', () => {
  let service: CampaignCountriesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    nationalCampaign: {
      findFirst: jest.fn(),
    },
    country: {
      findUnique: jest.fn(),
    },
    campaignCountry: {
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
        CampaignCountriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CampaignCountriesService>(CampaignCountriesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock the logger
    (service as any).logger = mockLogger;

    jest.clearAllMocks();
  });

  describe('findCountriesByCampaign', () => {
    it('should return countries for a valid campaign', async () => {
      const campaignId = 'campaign-123';
      const mockCampaign = {
        id: campaignId,
        code: 'brucellose_2025',
        nameFr: 'Brucellose 2025',
        deletedAt: null,
      };

      const mockAssociations = [
        {
          id: 'assoc-1',
          campaignId,
          countryCode: 'DZ',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          campaign: {
            id: campaignId,
            code: 'brucellose_2025',
            nameFr: 'Brucellose 2025',
            nameEn: 'Brucellosis 2025',
            nameAr: 'داء البروسيلا 2025',
            type: 'vaccination',
          },
          country: {
            code: 'DZ',
            nameFr: 'Algérie',
            nameEn: 'Algeria',
            nameAr: 'الجزائر',
            region: 'Africa',
          },
        },
      ];

      mockPrismaService.nationalCampaign.findFirst.mockResolvedValue(mockCampaign);
      mockPrismaService.campaignCountry.findMany.mockResolvedValue(mockAssociations);

      const result = await service.findCountriesByCampaign(campaignId);

      expect(result).toEqual(mockAssociations);
      expect(mockPrismaService.nationalCampaign.findFirst).toHaveBeenCalledWith({
        where: { id: campaignId, deletedAt: null },
      });
    });

    it('should throw NotFoundException if campaign does not exist', async () => {
      const campaignId = 'non-existent-campaign';
      mockPrismaService.nationalCampaign.findFirst.mockResolvedValue(null);

      await expect(service.findCountriesByCampaign(campaignId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findCountriesByCampaign(campaignId)).rejects.toThrow(
        `Campaign with ID ${campaignId} not found`,
      );
    });
  });

  describe('findCampaignsByCountry', () => {
    it('should return campaigns for a valid country', async () => {
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
          campaignId: 'campaign-123',
          countryCode,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          campaign: {
            id: 'campaign-123',
            code: 'brucellose_2025',
            nameFr: 'Brucellose 2025',
            nameEn: 'Brucellosis 2025',
            nameAr: 'داء البروسيلا 2025',
            type: 'vaccination',
            deletedAt: null,
          },
          country: mockCountry,
        },
      ];

      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.campaignCountry.findMany.mockResolvedValue(mockAssociations);

      const result = await service.findCampaignsByCountry(countryCode);

      expect(result).toEqual(mockAssociations);
      expect(mockPrismaService.country.findUnique).toHaveBeenCalledWith({
        where: { code: countryCode },
      });
    });

    it('should throw NotFoundException if country does not exist', async () => {
      const countryCode = 'XX';
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      await expect(service.findCampaignsByCountry(countryCode)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('link', () => {
    it('should create a new campaign-country association', async () => {
      const campaignId = 'campaign-123';
      const countryCode = 'DZ';

      const mockCampaign = {
        id: campaignId,
        code: 'brucellose_2025',
        deletedAt: null,
      };

      const mockCountry = {
        code: countryCode,
        nameFr: 'Algérie',
      };

      const mockAssociation = {
        id: 'assoc-1',
        campaignId,
        countryCode,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        campaign: {
          id: campaignId,
          code: 'brucellose_2025',
          nameFr: 'Brucellose 2025',
          nameEn: 'Brucellosis 2025',
          nameAr: 'داء البروسيلا 2025',
          type: 'vaccination',
        },
        country: mockCountry,
      };

      mockPrismaService.nationalCampaign.findFirst.mockResolvedValue(mockCampaign);
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.campaignCountry.findFirst.mockResolvedValue(null);
      mockPrismaService.campaignCountry.create.mockResolvedValue(mockAssociation);

      const result = await service.link(campaignId, countryCode);

      expect(result).toEqual(mockAssociation);
      expect(mockPrismaService.campaignCountry.create).toHaveBeenCalledWith({
        data: { campaignId, countryCode },
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException if association already exists and is active', async () => {
      const campaignId = 'campaign-123';
      const countryCode = 'DZ';

      const mockCampaign = { id: campaignId, deletedAt: null };
      const mockCountry = { code: countryCode };
      const mockExisting = {
        id: 'assoc-1',
        campaignId,
        countryCode,
        isActive: true,
      };

      mockPrismaService.nationalCampaign.findFirst.mockResolvedValue(mockCampaign);
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.campaignCountry.findFirst.mockResolvedValue(mockExisting);

      await expect(service.link(campaignId, countryCode)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should reactivate association if it exists but is inactive', async () => {
      const campaignId = 'campaign-123';
      const countryCode = 'DZ';

      const mockCampaign = { id: campaignId, deletedAt: null };
      const mockCountry = { code: countryCode };
      const mockExisting = {
        id: 'assoc-1',
        campaignId,
        countryCode,
        isActive: false,
      };

      const mockReactivated = {
        ...mockExisting,
        isActive: true,
        campaign: {
          id: campaignId,
          code: 'brucellose_2025',
          nameFr: 'Brucellose 2025',
          nameEn: 'Brucellosis 2025',
          nameAr: 'داء البروسيلا 2025',
          type: 'vaccination',
        },
        country: mockCountry,
      };

      mockPrismaService.nationalCampaign.findFirst.mockResolvedValue(mockCampaign);
      mockPrismaService.country.findUnique.mockResolvedValue(mockCountry);
      mockPrismaService.campaignCountry.findFirst.mockResolvedValue(mockExisting);
      mockPrismaService.campaignCountry.update.mockResolvedValue(mockReactivated);

      const result = await service.link(campaignId, countryCode);

      expect(result).toEqual(mockReactivated);
      expect(mockPrismaService.campaignCountry.update).toHaveBeenCalledWith({
        where: { id: mockExisting.id },
        data: { isActive: true },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if campaign does not exist', async () => {
      const campaignId = 'non-existent';
      const countryCode = 'DZ';

      mockPrismaService.nationalCampaign.findFirst.mockResolvedValue(null);

      await expect(service.link(campaignId, countryCode)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if country does not exist', async () => {
      const campaignId = 'campaign-123';
      const countryCode = 'XX';

      mockPrismaService.nationalCampaign.findFirst.mockResolvedValue({ id: campaignId });
      mockPrismaService.country.findUnique.mockResolvedValue(null);

      await expect(service.link(campaignId, countryCode)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unlink', () => {
    it('should deactivate an active association', async () => {
      const campaignId = 'campaign-123';
      const countryCode = 'DZ';

      const mockAssociation = {
        id: 'assoc-1',
        campaignId,
        countryCode,
        isActive: true,
      };

      const mockUpdated = {
        ...mockAssociation,
        isActive: false,
      };

      mockPrismaService.campaignCountry.findFirst.mockResolvedValue(mockAssociation);
      mockPrismaService.campaignCountry.update.mockResolvedValue(mockUpdated);

      const result = await service.unlink(campaignId, countryCode);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.campaignCountry.update).toHaveBeenCalledWith({
        where: { id: mockAssociation.id },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if association does not exist', async () => {
      const campaignId = 'campaign-123';
      const countryCode = 'DZ';

      mockPrismaService.campaignCountry.findFirst.mockResolvedValue(null);

      await expect(service.unlink(campaignId, countryCode)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active associations by default', async () => {
      const mockAssociations = [
        {
          id: 'assoc-1',
          campaignId: 'campaign-1',
          countryCode: 'DZ',
          isActive: true,
          campaign: {
            id: 'campaign-1',
            code: 'brucellose_2025',
            nameFr: 'Brucellose 2025',
            nameEn: 'Brucellosis 2025',
            nameAr: 'داء البروسيلا 2025',
            type: 'vaccination',
            deletedAt: null,
          },
          country: {
            code: 'DZ',
            nameFr: 'Algérie',
            nameEn: 'Algeria',
            nameAr: 'الجزائر',
          },
        },
      ];

      mockPrismaService.campaignCountry.findMany.mockResolvedValue(mockAssociations);

      const result = await service.findAll(false);

      expect(result).toEqual(mockAssociations);
      expect(mockPrismaService.campaignCountry.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
    });

    it('should include inactive associations when requested', async () => {
      mockPrismaService.campaignCountry.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(mockPrismaService.campaignCountry.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
    });
  });
});
