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
exports.AlertConfigurationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AlertConfigurationsService = class AlertConfigurationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(farmId, query) {
        const where = {
            farmId,
            deletedAt: null,
        };
        if (query.type)
            where.type = query.type;
        if (query.category)
            where.category = query.category;
        if (query.enabled !== undefined)
            where.enabled = query.enabled;
        return this.prisma.alertConfiguration.findMany({
            where,
            orderBy: [{ category: 'asc' }, { severity: 'desc' }],
        });
    }
    async findOne(farmId, id) {
        const config = await this.prisma.alertConfiguration.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!config) {
            throw new common_1.NotFoundException(`Alert configuration ${id} not found`);
        }
        return config;
    }
    async update(farmId, id, dto) {
        const existing = await this.prisma.alertConfiguration.findFirst({
            where: { id, farmId, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Alert configuration ${id} not found`);
        }
        if (dto.version && existing.version > dto.version) {
            throw new common_1.ConflictException({
                message: 'Version conflict',
                serverVersion: existing.version,
                serverData: existing,
            });
        }
        return this.prisma.alertConfiguration.update({
            where: { id },
            data: {
                ...dto,
                version: existing.version + 1,
            },
        });
    }
};
exports.AlertConfigurationsService = AlertConfigurationsService;
exports.AlertConfigurationsService = AlertConfigurationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertConfigurationsService);
//# sourceMappingURL=alert-configurations.service.js.map