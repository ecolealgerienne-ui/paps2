import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentDto } from './dto';
import { AppLogger } from '../common/utils/logger.service';
import {
  EntityNotFoundException,
  EntityConflictException,
} from '../common/exceptions';
import { ERROR_CODES } from '../common/constants/error-codes';

@Injectable()
export class DocumentsService {
  private readonly logger = new AppLogger(DocumentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateDocumentDto) {
    this.logger.debug(`Creating document in farm ${farmId}`, { title: dto.title, type: dto.type });

    try {
      // Destructure to exclude BaseSyncEntityDto fields and handle them explicitly
      const { farmId: dtoFarmId, created_at, updated_at, ...documentData } = dto;

      const document = await this.prisma.document.create({
        data: {
          ...documentData,
          farmId: dtoFarmId || farmId,
          uploadDate: new Date(dto.uploadDate),
          issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          // CRITICAL: Use client timestamps if provided (offline-first)
          ...(created_at && { createdAt: new Date(created_at) }),
          ...(updated_at && { updatedAt: new Date(updated_at) }),
        },
      });

      this.logger.audit('Document created', { documentId: document.id, farmId, type: dto.type });
      return document;
    } catch (error) {
      this.logger.error(`Failed to create document in farm ${farmId}`, error.stack);
      throw error;
    }
  }

  async findAll(farmId: string, query: QueryDocumentDto) {
    const where: any = {
      farmId,
      deletedAt: null,
    };

    if (query.type) where.type = query.type;
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expiryDate = {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      };
    }

    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(farmId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!document) {
      this.logger.warn('Document not found', { documentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.DOCUMENT_NOT_FOUND,
        `Document ${id} not found`,
        { documentId: id, farmId },
      );
    }

    return document;
  }

  async update(farmId: string, id: string, dto: UpdateDocumentDto) {
    this.logger.debug(`Updating document ${id} (version ${dto.version})`);

    const existing = await this.prisma.document.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Document not found', { documentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.DOCUMENT_NOT_FOUND,
        `Document ${id} not found`,
        { documentId: id, farmId },
      );
    }

    // Version conflict check
    if (dto.version && existing.version > dto.version) {
      this.logger.warn('Version conflict detected', {
        documentId: id,
        serverVersion: existing.version,
        clientVersion: dto.version,
      });

      throw new EntityConflictException(
        ERROR_CODES.VERSION_CONFLICT,
        'Version conflict detected',
        {
          documentId: id,
          serverVersion: existing.version,
          clientVersion: dto.version,
        },
      );
    }

    try {
      // Destructure to exclude BaseSyncEntityDto fields
      const { farmId: dtoFarmId, created_at, updated_at, version, ...documentData } = dto;

      const updateData: any = {
        ...documentData,
        version: existing.version + 1,
      };

      if (dto.uploadDate) updateData.uploadDate = new Date(dto.uploadDate);
      if (dto.issueDate) updateData.issueDate = new Date(dto.issueDate);
      if (dto.expiryDate) updateData.expiryDate = new Date(dto.expiryDate);
      // CRITICAL: Use client timestamp if provided (offline-first)
      if (updated_at) updateData.updatedAt = new Date(updated_at);

      const updated = await this.prisma.document.update({
        where: { id },
        data: updateData,
      });

      this.logger.audit('Document updated', {
        documentId: id,
        farmId,
        version: `${existing.version} → ${updated.version}`,
      });

      return updated;
    } catch (error) {
      this.logger.error(`Failed to update document ${id}`, error.stack);
      throw error;
    }
  }

  async remove(farmId: string, id: string) {
    this.logger.debug(`Soft deleting document ${id}`);

    const existing = await this.prisma.document.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      this.logger.warn('Document not found', { documentId: id, farmId });
      throw new EntityNotFoundException(
        ERROR_CODES.DOCUMENT_NOT_FOUND,
        `Document ${id} not found`,
        { documentId: id, farmId },
      );
    }

    try {
      const deleted = await this.prisma.document.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          version: existing.version + 1,
        },
      });

      this.logger.audit('Document soft deleted', { documentId: id, farmId });
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete document ${id}`, error.stack);
      throw error;
    }
  }

  // Get expiring documents
  async getExpiringDocuments(farmId: string, days: number = 30) {
    this.logger.debug(`Finding documents expiring in ${days} days for farm ${farmId}`);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.document.findMany({
      where: {
        farmId,
        deletedAt: null,
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  // Get expired documents
  async getExpiredDocuments(farmId: string) {
    this.logger.debug(`Finding expired documents for farm ${farmId}`);

    return this.prisma.document.findMany({
      where: {
        farmId,
        deletedAt: null,
        expiryDate: {
          lt: new Date(),
        },
      },
      orderBy: { expiryDate: 'desc' },
    });
  }
}
