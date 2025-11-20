import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto, QueryAnimalDto, UpdateAnimalDto } from './dto';

@Injectable()
export class AnimalsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateAnimalDto) {
    return this.prisma.animal.create({
      data: {
        id: dto.id,
        farmId,
        currentEid: dto.currentEid,
        officialNumber: dto.officialNumber,
        visualId: dto.visualId,
        birthDate: new Date(dto.birthDate),
        sex: dto.sex,
        motherId: dto.motherId,
        speciesId: dto.speciesId,
        breedId: dto.breedId,
        notes: dto.notes,
        status: 'alive',
      },
      include: {
        species: true,
        breed: true,
        mother: true,
      },
    });
  }

  async findAll(farmId: string, query: QueryAnimalDto) {
    const { status, speciesId, breedId, search, page, limit, sort, order } =
      query;

    const where = {
      farmId,
      deletedAt: null,
      ...(status && { status }),
      ...(speciesId && { speciesId }),
      ...(breedId && { breedId }),
      ...(search && {
        OR: [
          { currentEid: { contains: search, mode: 'insensitive' as const } },
          {
            officialNumber: { contains: search, mode: 'insensitive' as const },
          },
          { visualId: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [animals, total] = await Promise.all([
      this.prisma.animal.findMany({
        where,
        include: {
          species: true,
          breed: true,
        },
        orderBy: { [sort || 'createdAt']: order || 'desc' },
        skip: ((page || 1) - 1) * (limit || 50),
        take: limit || 50,
      }),
      this.prisma.animal.count({ where }),
    ]);

    return {
      data: animals,
      meta: {
        page: page || 1,
        limit: limit || 50,
        total,
        totalPages: Math.ceil(total / (limit || 50)),
      },
    };
  }

  async findOne(farmId: string, id: string) {
    const animal = await this.prisma.animal.findFirst({
      where: {
        id,
        farmId,
        deletedAt: null,
      },
      include: {
        species: true,
        breed: true,
        mother: true,
        children: true,
      },
    });

    if (!animal) {
      throw new NotFoundException(`Animal ${id} not found`);
    }

    return animal;
  }

  async update(farmId: string, id: string, dto: UpdateAnimalDto) {
    const existing = await this.findOne(farmId, id);

    // Vérification de version pour gestion des conflits
    if (dto.version && existing.version > dto.version) {
      throw new ConflictException({
        message: 'Version conflict',
        serverVersion: existing.version,
        clientVersion: dto.version,
      });
    }

    return this.prisma.animal.update({
      where: { id },
      data: {
        ...(dto.currentEid !== undefined && { currentEid: dto.currentEid }),
        ...(dto.officialNumber !== undefined && {
          officialNumber: dto.officialNumber,
        }),
        ...(dto.visualId !== undefined && { visualId: dto.visualId }),
        ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
        ...(dto.sex && { sex: dto.sex }),
        ...(dto.motherId !== undefined && { motherId: dto.motherId }),
        ...(dto.speciesId !== undefined && { speciesId: dto.speciesId }),
        ...(dto.breedId !== undefined && { breedId: dto.breedId }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        version: { increment: 1 },
      },
      include: {
        species: true,
        breed: true,
        mother: true,
      },
    });
  }

  async remove(farmId: string, id: string) {
    await this.findOne(farmId, id);

    // Soft delete
    return this.prisma.animal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
