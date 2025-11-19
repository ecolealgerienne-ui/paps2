"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
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
    async findAll(farmId, query) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (query.type)
            where.type = query.type;
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
    async findOne(farmId, id) {
        const document = await this.prisma.document.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document ${id} not found`);
        }
        return document;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.document.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Document ${id} not found`);
        }
        if (dto.version && existing.version > dto.version) {
            throw new common_1.ConflictException({
                message: 'Version conflict',
                serverVersion: existing.version,
                serverData: existing,
            });
        }
        const updateData = {
            ...dto,
            version: existing.version + 1,
        };
        if (dto.uploadDate)
            updateData.uploadDate = new Date(dto.uploadDate);
        if (dto.issueDate)
            updateData.issueDate = new Date(dto.issueDate);
        if (dto.expiryDate)
            updateData.expiryDate = new Date(dto.expiryDate);
        return this.prisma.document.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.document.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Document ${id} not found`);
        }
        return this.prisma.document.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
    async getExpiringDocuments(farmId, days = 30) {
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
    async getExpiredDocuments(farmId) {
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
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map