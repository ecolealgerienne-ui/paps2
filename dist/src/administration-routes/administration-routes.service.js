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
exports.AdministrationRoutesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdministrationRoutesService = class AdministrationRoutesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.administrationRoute.findUnique({
            where: { id: dto.id },
        });
        if (existing) {
            throw new common_1.ConflictException(`Administration route ${dto.id} already exists`);
        }
        return this.prisma.administrationRoute.create({
            data: dto,
        });
    }
    async findAll() {
        return this.prisma.administrationRoute.findMany({
            orderBy: { displayOrder: 'asc' },
        });
    }
    async findOne(id) {
        const route = await this.prisma.administrationRoute.findUnique({
            where: { id },
        });
        if (!route) {
            throw new common_1.NotFoundException(`Administration route ${id} not found`);
        }
        return route;
    }
    async update(id, dto) {
        const existing = await this.prisma.administrationRoute.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Administration route ${id} not found`);
        }
        return this.prisma.administrationRoute.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        const existing = await this.prisma.administrationRoute.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Administration route ${id} not found`);
        }
        return this.prisma.administrationRoute.delete({
            where: { id },
        });
    }
};
exports.AdministrationRoutesService = AdministrationRoutesService;
exports.AdministrationRoutesService = AdministrationRoutesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdministrationRoutesService);
//# sourceMappingURL=administration-routes.service.js.map