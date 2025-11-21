import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministrationRouteDto, UpdateAdministrationRouteDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';
import { createLangUpdateData } from '../common/utils/i18n.helper';

@Injectable()
export class AdministrationRoutesService {
  private readonly logger = new AppLogger(AdministrationRoutesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdministrationRouteDto) {
    this.logger.debug(`Creating administration route ${dto.id}`);

    // Check if ID already exists
    const existing = await this.prisma.administrationRoute.findUnique({
      where: { id: dto.id },
    });

    if (existing) {
      this.logger.warn('Administration route already exists', { routeId: dto.id });
      throw new EntityConflictException(
        ERROR_CODES.ADMINISTRATION_ROUTE_ALREADY_EXISTS,
        `Administration route ${dto.id} already exists`,
        { routeId: dto.id },
      );
    }

    try {
      // Map language to correct column
      const langData = createLangUpdateData(dto.name, dto.lang);

      const route = await this.prisma.administrationRoute.create({
        data: {
          id: dto.id,
          ...langData,
          // Initialize other languages as empty strings if not provided
          nameFr: langData.nameFr || '',
          nameEn: langData.nameEn || '',
          nameAr: langData.nameAr || '',
          displayOrder: dto.displayOrder ?? 0,
        },
      });

      this.logger.audit('Administration route created', { routeId: route.id, lang: dto.lang });
      return route;
    } catch (error) {
      this.logger.error(`Failed to create administration route ${dto.id}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.administrationRoute.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!route) {
      this.logger.warn('Administration route not found', { routeId: id });
      throw new EntityNotFoundException(
        ERROR_CODES.ADMINISTRATION_ROUTE_NOT_FOUND,
        `Administration route ${id} not found`,
        { routeId: id },
      );
    }

    return route;
  }

  async update(id: string, dto: UpdateAdministrationRouteDto) {
    this.logger.debug(`Updating administration route ${id}`);

    const existing = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!existing) {
      this.logger.warn('Administration route not found', { routeId: id });
      throw new EntityNotFoundException(
        ERROR_CODES.ADMINISTRATION_ROUTE_NOT_FOUND,
        `Administration route ${id} not found`,
        { routeId: id },
      );
    }

    // Validate: if name is provided, lang must be provided too
    if (dto.name && !dto.lang) {
      throw new BadRequestException('Language code (lang) is required when updating name');
    }

    try {
      // Build update data
      const updateData: any = {};

      // Handle language-specific name update
      if (dto.name && dto.lang) {
        const langData = createLangUpdateData(dto.name, dto.lang);
        Object.assign(updateData, langData);
      }

      // Handle other fields
      if (dto.displayOrder !== undefined) updateData.displayOrder = dto.displayOrder;

      const updated = await this.prisma.administrationRoute.update({
        where: { id },
        data: updateData,
      });

      this.logger.audit('Administration route updated', { routeId: id, lang: dto.lang });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update administration route ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.debug(`Deleting administration route ${id}`);

    const existing = await this.prisma.administrationRoute.findUnique({
      where: { id },
    });

    if (!existing) {
      this.logger.warn('Administration route not found', { routeId: id });
      throw new EntityNotFoundException(
        ERROR_CODES.ADMINISTRATION_ROUTE_NOT_FOUND,
        `Administration route ${id} not found`,
        { routeId: id },
      );
    }

    try {
      const deleted = await this.prisma.administrationRoute.delete({
        where: { id },
      });

      this.logger.audit('Administration route deleted', { routeId: id });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete administration route ${id}`, error.stack);
      throw error;
    }
  }
}
