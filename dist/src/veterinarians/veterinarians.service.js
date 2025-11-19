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
exports.VeterinariansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VeterinariansService = class VeterinariansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.veterinarian.create({
            data: dto,
        });
    }
    async findAll(query) {
        const where = {};
        if (query.search) {
            where.name = { contains: query.search, mode: 'insensitive' };
        }
        if (query.isActive !== undefined) {
            where.isActive = query.isActive;
        }
        return this.prisma.veterinarian.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const vet = await this.prisma.veterinarian.findUnique({
            where: { id },
        });
        if (!vet) {
            throw new common_1.NotFoundException(`Veterinarian ${id} not found`);
        }
        return vet;
    }
    async update(id, dto) {
        const existing = await this.prisma.veterinarian.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Veterinarian ${id} not found`);
        }
        return this.prisma.veterinarian.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        const existing = await this.prisma.veterinarian.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Veterinarian ${id} not found`);
        }
        return this.prisma.veterinarian.delete({
            where: { id },
        });
    }
};
exports.VeterinariansService = VeterinariansService;
exports.VeterinariansService = VeterinariansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VeterinariansService);
//# sourceMappingURL=veterinarians.service.js.map