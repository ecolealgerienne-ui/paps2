import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccinationDto, UpdateVaccinationDto, QueryVaccinationDto } from './dto';

@Injectable()
export class VaccinationsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateVaccinationDto) {
    // Verify single animal if provided
    if (dto.animalId) {
      const animal = await this.prisma.animal.findFirst({
        where: { id: dto.animalId, farmId, deletedAt: null },
      });

      if (!animal) {
        throw new NotFoundException(`Animal ${dto.animalId} not found`);
      }
    }

    return this.prisma.vaccination.create({
      data: {
        ...dto,
        farmId,
        vaccinationDate: new Date(dto.vaccinationDate),
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });
  }

  async findAll(farmId: string, query: QueryVaccinationDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.animalId) where.animalId = query.animalId;
    if (query.type) where.type = query.type;
    if (query.fromDate || query.toDate) {
      where.vaccinationDate = {};
      if (query.fromDate) where.vaccinationDate.gte = new Date(query.fromDate);
      if (query.toDate) where.vaccinationDate.lte = new Date(query.toDate);
    }

    return this.prisma.vaccination.findMany({
      where,
      orderBy: { vaccinationDate: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const vaccination = await this.prisma.vaccination.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!vaccination) {
      throw new NotFoundException(`Vaccination ${id} not found`);
    }

    return vaccination;
  }

  async update(farmId: string, id: string, dto: UpdateVaccinationDto) {
    const existing = await this.prisma.vaccination.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Vaccination ${id} not found`);
    }

    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        serverData: existing,
      });
    }

    const updateData: any = {
      ...dto,
      version: existing.version + 1,
    };

    if (dto.vaccinationDate) updateData.vaccinationDate = new Date(dto.vaccinationDate);
    if (dto.nextDueDate) updateData.nextDueDate = new Date(dto.nextDueDate);
    if (dto.expiryDate) updateData.expiryDate = new Date(dto.expiryDate);

    return this.prisma.vaccination.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.vaccination.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Vaccination ${id} not found`);
    }

    return this.prisma.vaccination.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }
}
