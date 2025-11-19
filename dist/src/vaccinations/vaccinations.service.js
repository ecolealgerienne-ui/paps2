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
exports.VaccinationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VaccinationsService = class VaccinationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(farmId, dto) {
        const animal = await this.prisma.animal.findFirst({
            where: { id: dto.animalId, farmId, deletedAt: null },
        });
        if (!animal) {
            throw new common_1.NotFoundException(`Animal ${dto.animalId} not found`);
        }
        return this.prisma.vaccination.create({
            data: {
                ...dto,
                farmId,
                vaccinationDate: new Date(dto.vaccinationDate),
                nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
            },
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
                veterinarian: true,
            },
        });
    }
    async findAll(farmId, query) {
        const where = {
            animal: { farmId },
            deletedAt: null,
        };
        if (query.animalId)
            where.animalId = query.animalId;
        if (query.type)
            where.type = query.type;
        if (query.fromDate || query.toDate) {
            where.vaccinationDate = {};
            if (query.fromDate)
                where.vaccinationDate.gte = new Date(query.fromDate);
            if (query.toDate)
                where.vaccinationDate.lte = new Date(query.toDate);
        }
        return this.prisma.vaccination.findMany({
            where,
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
                veterinarian: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { vaccinationDate: 'desc' },
        });
    }
    async findOne(farmId, id) {
        const vaccination = await this.prisma.vaccination.findFirst({
            where: {
                id,
                animal: { farmId },
                deletedAt: null,
            },
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
                veterinarian: true,
            },
        });
        if (!vaccination) {
            throw new common_1.NotFoundException(`Vaccination ${id} not found`);
        }
        return vaccination;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.vaccination.findFirst({
            where: {
                id,
                animal: { farmId },
                deletedAt: null,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Vaccination ${id} not found`);
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
        if (dto.vaccinationDate)
            updateData.vaccinationDate = new Date(dto.vaccinationDate);
        if (dto.nextDueDate)
            updateData.nextDueDate = new Date(dto.nextDueDate);
        return this.prisma.vaccination.update({
            where: { id },
            data: updateData,
            include: {
                animal: { select: { id: true, visualId: true, currentEid: true } },
                veterinarian: true,
            },
        });
    }
    async remove(farmId, id) {
        const existing = await this.prisma.vaccination.findFirst({
            where: {
                id,
                animal: { farmId },
                deletedAt: null,
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Vaccination ${id} not found`);
        }
        return this.prisma.vaccination.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                version: existing.version + 1,
            },
        });
    }
};
exports.VaccinationsService = VaccinationsService;
exports.VaccinationsService = VaccinationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VaccinationsService);
//# sourceMappingURL=vaccinations.service.js.map