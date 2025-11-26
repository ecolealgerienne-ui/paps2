import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVaccineGlobalDto,
  VaccineTargetDisease,
} from './dto/create-vaccine-global.dto';
import { UpdateVaccineGlobalDto } from './dto/update-vaccine-global.dto';
import { DataScope, Vaccine } from '@prisma/client';

/**
 * Service pour la gestion des vaccins globaux
 * Uses unified Vaccine table with scope='global'
 */
@Injectable()
export class VaccinesGlobalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau vaccin global
   */
  async create(dto: CreateVaccineGlobalDto): Promise<Vaccine> {
    // Vérifier si le code existe déjà
    const existing = await this.prisma.vaccine.findFirst({
      where: {
        code: dto.code,
        scope: DataScope.global,
      },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(
        `Vaccine with code "${dto.code}" already exists`,
      );
    }

    // Si soft-deleted, restaurer
    if (existing && existing.deletedAt) {
      return this.prisma.vaccine.update({
        where: { id: existing.id },
        data: {
          ...dto,
          deletedAt: null,
          version: existing.version + 1,
        },
      });
    }

    return this.prisma.vaccine.create({
      data: {
        ...dto,
        scope: DataScope.global,
        farmId: null, // Global vaccines have no farm
      },
    });
  }

  /**
   * Récupérer tous les vaccins avec filtres optionnels
   */
  async findAll(filters?: {
    targetDisease?: VaccineTargetDisease;
    includeDeleted?: boolean;
  }): Promise<Vaccine[]> {
    const where: Record<string, unknown> = {
      scope: DataScope.global, // Only return global vaccines
    };

    // Exclure les soft deleted par défaut
    if (!filters?.includeDeleted) {
      where.deletedAt = null;
    }

    // Filtrer par maladie cible si spécifié
    if (filters?.targetDisease) {
      where.targetDisease = filters.targetDisease;
    }

    return this.prisma.vaccine.findMany({
      where,
      orderBy: [{ targetDisease: 'asc' }, { nameFr: 'asc' }],
    });
  }

  /**
   * Récupérer les vaccins par maladie cible
   */
  async findByTargetDisease(disease: VaccineTargetDisease): Promise<Vaccine[]> {
    return this.prisma.vaccine.findMany({
      where: {
        targetDisease: disease,
        scope: DataScope.global,
        deletedAt: null,
      },
      orderBy: { nameFr: 'asc' },
    });
  }

  /**
   * Récupérer un vaccin par ID
   */
  async findOne(id: string): Promise<Vaccine> {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: {
        id,
        scope: DataScope.global,
      },
    });

    if (!vaccine || vaccine.deletedAt) {
      throw new NotFoundException(`Vaccine with ID "${id}" not found`);
    }

    return vaccine;
  }

  /**
   * Récupérer un vaccin par code
   */
  async findByCode(code: string): Promise<Vaccine> {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: {
        code,
        scope: DataScope.global,
      },
    });

    if (!vaccine || vaccine.deletedAt) {
      throw new NotFoundException(`Vaccine with code "${code}" not found`);
    }

    return vaccine;
  }

  /**
   * Mettre à jour un vaccin (avec versioning optimiste)
   */
  async update(
    id: string,
    dto: UpdateVaccineGlobalDto,
    currentVersion?: number,
  ): Promise<Vaccine> {
    // Vérifier que le vaccin existe
    const existing = await this.findOne(id);

    // Versioning optimiste : vérifier que la version correspond
    if (currentVersion !== undefined && existing.version !== currentVersion) {
      throw new ConflictException(
        `Version mismatch: expected ${currentVersion}, got ${existing.version}`,
      );
    }

    // Mettre à jour avec incrément de version
    return this.prisma.vaccine.update({
      where: { id },
      data: {
        ...dto,
        version: { increment: 1 },
      },
    });
  }

  /**
   * Soft delete d'un vaccin
   */
  async remove(id: string): Promise<Vaccine> {
    // Vérifier que le vaccin existe
    await this.findOne(id);

    // Soft delete
    return this.prisma.vaccine.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Récupérer la liste des maladies cibles disponibles
   */
  async getTargetDiseases(): Promise<string[]> {
    const diseases = await this.prisma.vaccine.findMany({
      where: {
        scope: DataScope.global,
        deletedAt: null,
      },
      select: { targetDisease: true },
      distinct: ['targetDisease'],
      orderBy: { targetDisease: 'asc' },
    });

    return diseases.map((d) => d.targetDisease).filter(Boolean) as string[];
  }

  /**
   * Restaurer un vaccin soft deleted
   */
  async restore(id: string): Promise<Vaccine> {
    const vaccine = await this.prisma.vaccine.findFirst({
      where: {
        id,
        scope: DataScope.global,
      },
    });

    if (!vaccine) {
      throw new NotFoundException(`Vaccine with ID "${id}" not found`);
    }

    if (!vaccine.deletedAt) {
      throw new ConflictException(`Vaccine "${vaccine.code}" is not deleted`);
    }

    return this.prisma.vaccine.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }
}
