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
var LotsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LotsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logger_service_1 = require("../common/utils/logger.service");
const exceptions_1 = require("../common/exceptions");
const error_codes_1 = require("../common/constants/error-codes");
let LotsService = LotsService_1 = class LotsService {
    prisma;
    logger = new logger_service_1.AppLogger(LotsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        this.logger.debug(`Creating lot in farm ${farmId}`, { name: dto.name });
        try {
            const lot = await this.prisma.lot.create({
                data: {
                    ...dto,
                    farmId,
                },
                include: {
                    _count: { select: { lotAnimals: true } },
                },
            });
            this.logger.audit('Lot created', { lotId: lot.id, farmId, name: lot.name });
            return lot;
        }
        catch (error) {
            this.logger.error(`Failed to create lot in farm ${farmId}`, error.stack);
            throw error;
        }
    }
    async findAll(farmId, query) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (query.type)
            where.type = query.type;
        if (query.status)
            where.status = query.status;
        if (query.completed !== undefined)
            where.completed = query.completed;
        if (query.isActive !== undefined)
            where.isActive = query.isActive;
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        return this.prisma.lot.findMany({
            where,
            include: {
                _count: { select: { lotAnimals: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(farmId, id) {
        this.logger.debug(`Finding lot ${id} in farm ${farmId}`);
        const lot = await this.prisma.lot.findFirst({
            where: { id, farmId, deletedAt: null },
            include: {
                lotAnimals: {
                    where: { leftAt: null },
                    include: {
                        animal: {
                            select: {
                                id: true,
                                visualId: true,
                                currentEid: true,
                                sex: true,
                                status: true,
                                birthDate: true,
                            },
                        },
                    },
                },
                _count: { select: { lotAnimals: true } },
            },
        });
        if (!lot) {
            this.logger.warn('Lot not found', { lotId: id, farmId });
            throw new exceptions_1.EntityNotFoundException(error_codes_1.ERROR_CODES.LOT_NOT_FOUND, `Lot ${id} not found`, { lotId: id, farmId });
        }
        return lot;
    }
    async update(farmId, id, dto) {
        this.logger.debug(`Updating lot ${id} (version ${dto.version})`);
        const existing = await this.prisma.lot.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            this.logger.warn('Lot not found', { lotId: id, farmId });
            throw new exceptions_1.EntityNotFoundException(error_codes_1.ERROR_CODES.LOT_NOT_FOUND, `Lot ${id} not found`, { lotId: id, farmId });
        }
        if (dto.version && existing.version > dto.version) {
            this.logger.warn('Version conflict detected', {
                lotId: id,
                serverVersion: existing.version,
                clientVersion: dto.version,
            });
            throw new exceptions_1.EntityConflictException(error_codes_1.ERROR_CODES.VERSION_CONFLICT, 'Version conflict detected', {
                lotId: id,
                serverVersion: existing.version,
                clientVersion: dto.version,
            });
        }
        try {
            const updated = await this.prisma.lot.update({
                where: { id },
                data: {
                    ...dto,
                    version: existing.version + 1,
                },
                include: {
                    _count: { select: { lotAnimals: true } },
                },
            });
            this.logger.audit('Lot updated', {
                lotId: id,
                farmId,
                version: `${existing.version} → ${updated.version}`,
            });
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to update lot ${id}`, error.stack);
            throw error;
        }
    }
    async remove(farmId, id) {
        this.logger.debug(`Soft deleting lot ${id}`);
        const existing = await this.prisma.lot.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            this.logger.warn('Lot not found', { lotId: id, farmId });
            throw new exceptions_1.EntityNotFoundException(error_codes_1.ERROR_CODES.LOT_NOT_FOUND, `Lot ${id} not found`, { lotId: id, farmId });
        }
        try {
            const deleted = await this.prisma.lot.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    version: existing.version + 1,
                },
            });
            this.logger.audit('Lot soft deleted', { lotId: id, farmId });
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete lot ${id}`, error.stack);
            throw error;
        }
    }
    async addAnimals(farmId, lotId, dto) {
        this.logger.debug(`Adding ${dto.animalIds.length} animals to lot ${lotId}`);
        const lot = await this.prisma.lot.findFirst({
            where: { id: lotId, farmId, deletedAt: null },
        });
        if (!lot) {
            this.logger.warn('Lot not found', { lotId, farmId });
            throw new exceptions_1.EntityNotFoundException(error_codes_1.ERROR_CODES.LOT_NOT_FOUND, `Lot ${lotId} not found`, { lotId, farmId });
        }
        try {
            const creates = dto.animalIds.map(animalId => ({
                farmId,
                lotId,
                animalId,
                joinedAt: new Date(),
            }));
            await this.prisma.lotAnimal.createMany({
                data: creates,
                skipDuplicates: true,
            });
            this.logger.audit('Animals added to lot', {
                lotId,
                farmId,
                count: dto.animalIds.length,
            });
            return this.findOne(farmId, lotId);
        }
        catch (error) {
            this.logger.error(`Failed to add animals to lot ${lotId}`, error.stack);
            throw error;
        }
    }
    async removeAnimals(farmId, lotId, animalIds) {
        this.logger.debug(`Removing ${animalIds.length} animals from lot ${lotId}`);
        const lot = await this.prisma.lot.findFirst({
            where: { id: lotId, farmId, deletedAt: null },
        });
        if (!lot) {
            this.logger.warn('Lot not found', { lotId, farmId });
            throw new exceptions_1.EntityNotFoundException(error_codes_1.ERROR_CODES.LOT_NOT_FOUND, `Lot ${lotId} not found`, { lotId, farmId });
        }
        try {
            await this.prisma.lotAnimal.updateMany({
                where: {
                    lotId,
                    animalId: { in: animalIds },
                    leftAt: null,
                },
                data: {
                    leftAt: new Date(),
                },
            });
            this.logger.audit('Animals removed from lot', {
                lotId,
                farmId,
                count: animalIds.length,
            });
            return this.findOne(farmId, lotId);
        }
        catch (error) {
            this.logger.error(`Failed to remove animals from lot ${lotId}`, error.stack);
            throw error;
        }
    }
    async finalize(farmId, lotId) {
        this.logger.debug(`Finalizing lot ${lotId}`);
        const lot = await this.prisma.lot.findFirst({
            where: { id: lotId, farmId, deletedAt: null },
        });
        if (!lot) {
            this.logger.warn('Lot not found', { lotId, farmId });
            throw new exceptions_1.EntityNotFoundException(error_codes_1.ERROR_CODES.LOT_NOT_FOUND, `Lot ${lotId} not found`, { lotId, farmId });
        }
        try {
            const finalized = await this.prisma.lot.update({
                where: { id: lotId },
                data: {
                    completed: true,
                    status: 'closed',
                    version: lot.version + 1,
                },
                include: {
                    _count: { select: { lotAnimals: true } },
                },
            });
            this.logger.audit('Lot finalized', { lotId, farmId });
            return finalized;
        }
        catch (error) {
            this.logger.error(`Failed to finalize lot ${lotId}`, error.stack);
            throw error;
        }
    }
};
exports.LotsService = LotsService;
exports.LotsService = LotsService = LotsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LotsService);
//# sourceMappingURL=lots.service.js.map