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
exports.FarmPreferencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FarmPreferencesService = class FarmPreferencesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(farmId) {
        const preferences = await this.prisma.farmPreferences.findFirst({
            where: { farmId, deletedAt: null },
        });
        if (!preferences) {
            return {
                farmId,
                defaultVeterinarianId: null,
                defaultSpeciesId: null,
                defaultBreedId: null,
                weightUnit: 'kg',
                currency: 'DZD',
                language: 'fr',
                dateFormat: 'DD/MM/YYYY',
                enableNotifications: true,
                version: 1,
            };
        }
        return preferences;
    }
    async update(farmId, dto) {
        const existing = await this.prisma.farmPreferences.findFirst({
            where: { farmId, deletedAt: null },
        });
        if (!existing) {
            return this.prisma.farmPreferences.create({
                data: {
                    farmId,
                    defaultSpeciesId: dto.defaultSpeciesId || '',
                    ...dto,
                    version: 1,
                },
            });
        }
        if (dto.version && existing.version > dto.version) {
            throw new common_1.ConflictException({
                message: 'Version conflict',
                serverVersion: existing.version,
                serverData: existing,
            });
        }
        return this.prisma.farmPreferences.update({
            where: { id: existing.id },
            data: {
                ...dto,
                version: existing.version + 1,
            },
        });
    }
};
exports.FarmPreferencesService = FarmPreferencesService;
exports.FarmPreferencesService = FarmPreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FarmPreferencesService);
//# sourceMappingURL=farm-preferences.service.js.map