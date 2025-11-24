import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccineCountryDto, UpdateVaccineCountryDto } from './dto';

@Injectable()
export class VaccineCountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVaccineCountryDto) {
    // Check if association already exists
    const existing = await this.prisma.vaccineCountry.findUnique({
      where: {
        vaccineId_countryCode: {
          vaccineId: dto.vaccineId,
          countryCode: dto.countryCode,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Association between vaccine ${dto.vaccineId} and country ${dto.countryCode} already exists`,
      );
    }

    return this.prisma.vaccineCountry.create({
      data: {
        vaccineId: dto.vaccineId,
        countryCode: dto.countryCode,
        numeroAMM: dto.numeroAMM,
        isActive: dto.isActive ?? true,
      },
      include: {
        vaccine: true,
        country: true,
      },
    });
  }

  async findAll() {
    return this.prisma.vaccineCountry.findMany({
      include: {
        vaccine: true,
        country: true,
      },
      orderBy: [{ vaccine: { code: 'asc' } }, { countryCode: 'asc' }],
    });
  }

  async findByVaccine(vaccineId: string) {
    return this.prisma.vaccineCountry.findMany({
      where: { vaccineId },
      include: {
        vaccine: true,
        country: true,
      },
      orderBy: { countryCode: 'asc' },
    });
  }

  async findByCountry(countryCode: string) {
    return this.prisma.vaccineCountry.findMany({
      where: { countryCode },
      include: {
        vaccine: true,
        country: true,
      },
      orderBy: { vaccine: { code: 'asc' } },
    });
  }

  async findOne(id: string) {
    const vaccineCountry = await this.prisma.vaccineCountry.findUnique({
      where: { id },
      include: {
        vaccine: true,
        country: true,
      },
    });

    if (!vaccineCountry) {
      throw new NotFoundException(`VaccineCountry with ID ${id} not found`);
    }

    return vaccineCountry;
  }

  async update(id: string, dto: UpdateVaccineCountryDto) {
    await this.findOne(id); // Check existence

    return this.prisma.vaccineCountry.update({
      where: { id },
      data: {
        numeroAMM: dto.numeroAMM,
        isActive: dto.isActive,
      },
      include: {
        vaccine: true,
        country: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence

    return this.prisma.vaccineCountry.delete({
      where: { id },
    });
  }
}
