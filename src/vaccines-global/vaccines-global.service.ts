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

/**
 * Type temporaire pour VaccineGlobal
 * (sera remplacé par @prisma/client après génération)
 */
type VaccineGlobal = {
  id: string;
  code: string;
  nameFr: string;
  nameEn: string;
  nameAr: string;
  description: string | null;
  targetDisease: string;
  laboratoire: string | null;
  numeroAMM: string | null;
  dosageRecommande: string | null;
  dureeImmunite: number | null;
  version: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Service pour la gestion des vaccins globaux
 * PHASE_06: Référentiel international des vaccins
 */
@Injectable()
export class VaccinesGlobalService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau vaccin global
   */
  async create(dto: CreateVaccineGlobalDto): Promise<VaccineGlobal> {
    // Vérifier si le code existe déjà
    const existing = await this.prisma.vaccineGlobal.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Vaccine with code "${dto.code}" already exists`,
      );
    }

    return this.prisma.vaccineGlobal.create({
      data: {
        ...dto,
      },
    }) as Promise<VaccineGlobal>;
  }

  /**
   * Récupérer tous les vaccins avec filtres optionnels
   */
  async findAll(filters?: {
    targetDisease?: VaccineTargetDisease;
    includeDeleted?: boolean;
  }): Promise<VaccineGlobal[]> {
    const where: Record<string, unknown> = {};

    // Exclure les soft deleted par défaut
    if (!filters?.includeDeleted) {
      where.deletedAt = null;
    }

    // Filtrer par maladie cible si spécifié
    if (filters?.targetDisease) {
      where.targetDisease = filters.targetDisease;
    }

    return this.prisma.vaccineGlobal.findMany({
      where,
      orderBy: [{ targetDisease: 'asc' }, { nameFr: 'asc' }],
    }) as Promise<VaccineGlobal[]>;
  }

  /**
   * Récupérer les vaccins par maladie cible
   */
  async findByTargetDisease(
    disease: VaccineTargetDisease,
  ): Promise<VaccineGlobal[]> {
    return this.prisma.vaccineGlobal.findMany({
      where: {
        targetDisease: disease,
        deletedAt: null,
      },
      orderBy: { nameFr: 'asc' },
    }) as Promise<VaccineGlobal[]>;
  }

  /**
   * Récupérer un vaccin par ID
   */
  async findOne(id: string): Promise<VaccineGlobal> {
    const vaccine = await this.prisma.vaccineGlobal.findUnique({
      where: { id },
    });

    if (!vaccine || vaccine.deletedAt) {
      throw new NotFoundException(`Vaccine with ID "${id}" not found`);
    }

    return vaccine as VaccineGlobal;
  }

  /**
   * Récupérer un vaccin par code
   */
  async findByCode(code: string): Promise<VaccineGlobal> {
    const vaccine = await this.prisma.vaccineGlobal.findUnique({
      where: { code },
    });

    if (!vaccine || vaccine.deletedAt) {
      throw new NotFoundException(`Vaccine with code "${code}" not found`);
    }

    return vaccine as VaccineGlobal;
  }

  /**
   * Mettre à jour un vaccin (avec versioning optimiste)
   */
  async update(
    id: string,
    dto: UpdateVaccineGlobalDto,
    currentVersion?: number,
  ): Promise<VaccineGlobal> {
    // Vérifier que le vaccin existe
    const existing = await this.findOne(id);

    // Versioning optimiste : vérifier que la version correspond
    if (currentVersion !== undefined && existing.version !== currentVersion) {
      throw new ConflictException(
        `Version mismatch: expected ${currentVersion}, got ${existing.version}`,
      );
    }

    // Mettre à jour avec incrément de version
    return this.prisma.vaccineGlobal.update({
      where: { id },
      data: {
        ...dto,
        version: { increment: 1 },
      },
    }) as Promise<VaccineGlobal>;
  }

  /**
   * Soft delete d'un vaccin
   */
  async remove(id: string): Promise<VaccineGlobal> {
    // Vérifier que le vaccin existe
    const vaccine = await this.findOne(id);

    // Vérifier si le vaccin est utilisé dans des relations
    const usageCount = await this.checkUsage(id);

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete vaccine "${vaccine.code}": used in ${usageCount} relations (countries, farm preferences). Please deactivate instead.`,
      );
    }

    // Soft delete
    return this.prisma.vaccineGlobal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    }) as Promise<VaccineGlobal>;
  }

  /**
   * Vérifier l'utilisation du vaccin dans les relations
   * TODO: Activer après BLOC 3 (Phase 18) et BLOC 4 (Phase 22)
   */
  private async checkUsage(id: string): Promise<number> {
    // Temporairement retourne 0 car les tables de liaison n'existent pas encore
    // await Promise.all([
    //   this.prisma.vaccineCountry.count({ where: { vaccineId: id } }),
    //   this.prisma.farmVaccinePreference.count({ where: { vaccineId: id } }),
    // ]);
    return 0;
  }

  /**
   * Récupérer la liste des maladies cibles disponibles
   */
  async getTargetDiseases(): Promise<string[]> {
    const diseases = await this.prisma.vaccineGlobal.findMany({
      where: { deletedAt: null },
      select: { targetDisease: true },
      distinct: ['targetDisease'],
      orderBy: { targetDisease: 'asc' },
    });

    return diseases.map((d) => d.targetDisease);
  }

  /**
   * Restaurer un vaccin soft deleted
   */
  async restore(id: string): Promise<VaccineGlobal> {
    const vaccine = await this.prisma.vaccineGlobal.findUnique({
      where: { id },
    });

    if (!vaccine) {
      throw new NotFoundException(`Vaccine with ID "${id}" not found`);
    }

    if (!vaccine.deletedAt) {
      throw new ConflictException(`Vaccine "${vaccine.code}" is not deleted`);
    }

    return this.prisma.vaccineGlobal.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    }) as Promise<VaccineGlobal>;
  }
}
