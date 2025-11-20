import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentDto } from './dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        ...dto,
        farmId,
        uploadDate: new Date(dto.uploadDate),
        issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });
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
      throw new NotFoundException(`Document ${id} not found`);
    }

    return document;
  }

  async update(farmId: string, id: string, dto: UpdateDocumentDto) {
    const existing = await this.prisma.document.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Document ${id} not found`);
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

    if (dto.uploadDate) updateData.uploadDate = new Date(dto.uploadDate);
    if (dto.issueDate) updateData.issueDate = new Date(dto.issueDate);
    if (dto.expiryDate) updateData.expiryDate = new Date(dto.expiryDate);

    return this.prisma.document.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(farmId: string, id: string) {
    const existing = await this.prisma.document.findFirst({
      where: { id, farmId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: existing.version + 1,
      },
    });
  }

  // Get expiring documents
  async getExpiringDocuments(farmId: string, days: number = 30) {
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
