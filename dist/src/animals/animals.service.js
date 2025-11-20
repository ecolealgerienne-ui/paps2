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
var AnimalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logger_service_1 = require("../common/utils/logger.service");
const exceptions_1 = require("../common/exceptions");
const error_codes_1 = require("../common/constants/error-codes");
let AnimalsService = AnimalsService_1 = class AnimalsService {
    prisma;
    logger = new logger_service_1.AppLogger(AnimalsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        this.logger.debug(`Creating animal in farm ${farmId}`, {
            eid: dto.currentEid,
            species: dto.speciesId,
        });
        try {
            const animal = await this.prisma.animal.create({
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
            this.logger.audit('Animal created', {
                animalId: animal.id,
                farmId,
                species: dto.speciesId,
                eid: dto.currentEid,
            });
            return animal;
        }
        catch (error) {
            this.logger.error(`Failed to create animal in farm ${farmId}`, error.stack);
            throw error;
        }
    }
    async findAll(farmId, query) {
        const { status, speciesId, breedId, search, page, limit, sort, order } = query;
        const where = {
            farmId,
            deletedAt: null,
            ...(status && { status }),
            ...(speciesId && { speciesId }),
            ...(breedId && { breedId }),
            ...(search && {
                OR: [
                    { currentEid: { contains: search, mode: 'insensitive' } },
                    {
                        officialNumber: { contains: search, mode: 'insensitive' },
                    },
                    { visualId: { contains: search, mode: 'insensitive' } },
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
    async findOne(farmId, id) {
        this.logger.debug(`Finding animal ${id} in farm ${farmId}`);
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
            this.logger.warn('Animal not found', { animalId: id, farmId });
            throw new exceptions_1.EntityNotFoundException(error_codes_1.ERROR_CODES.ANIMAL_NOT_FOUND, `Animal ${id} not found`, { animalId: id, farmId });
        }
        return animal;
    }
    async update(farmId, id, dto) {
        this.logger.debug(`Updating animal ${id} (version ${dto.version})`);
        const existing = await this.findOne(farmId, id);
        if (dto.version && existing.version > dto.version) {
            this.logger.warn('Version conflict detected', {
                animalId: id,
                serverVersion: existing.version,
                clientVersion: dto.version,
            });
            throw new exceptions_1.EntityConflictException(error_codes_1.ERROR_CODES.VERSION_CONFLICT, 'Version conflict detected', {
                animalId: id,
                serverVersion: existing.version,
                clientVersion: dto.version,
            });
        }
        try {
            const updated = await this.prisma.animal.update({
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
            this.logger.audit('Animal updated', {
                animalId: id,
                farmId,
                version: `${existing.version} → ${updated.version}`,
            });
            return updated;
        }
        catch (error) {
            this.logger.error(`Failed to update animal ${id}`, error.stack);
            throw error;
        }
    }
    async remove(farmId, id) {
        this.logger.debug(`Soft deleting animal ${id}`);
        await this.findOne(farmId, id);
        try {
            const deleted = await this.prisma.animal.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
            this.logger.audit('Animal soft deleted', {
                animalId: id,
                farmId,
            });
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete animal ${id}`, error.stack);
            throw error;
        }
    }
};
exports.AnimalsService = AnimalsService;
exports.AnimalsService = AnimalsService = AnimalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnimalsService);
//# sourceMappingURL=animals.service.js.map