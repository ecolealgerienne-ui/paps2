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
exports.AnimalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnimalsService = class AnimalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
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
            throw new common_1.NotFoundException(`Animal ${id} not found`);
        }
        return animal;
    }
    async update(farmId, id, dto) {
        const existing = await this.findOne(farmId, id);
        if (dto.version && existing.version > dto.version) {
            throw new common_1.ConflictException({
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
    async remove(farmId, id) {
        await this.findOne(farmId, id);
        return this.prisma.animal.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }
};
exports.AnimalsService = AnimalsService;
exports.AnimalsService = AnimalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnimalsService);
//# sourceMappingURL=animals.service.js.map