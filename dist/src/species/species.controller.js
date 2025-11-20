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
exports.SpeciesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const species_service_1 = require("./species.service");
let SpeciesController = class SpeciesController {
    speciesService;
    constructor(speciesService) {
        this.speciesService = speciesService;
    }
    async findAll() {
        const species = await this.speciesService.findAll();
        return {
            success: true,
            data: species.map(s => ({
                id: s.id,
                name_fr: s.nameFr,
                name_en: s.nameEn,
                name_ar: s.nameAr,
                icon: s.icon,
                display_order: s.displayOrder,
            })),
        };
    }
};
exports.SpeciesController = SpeciesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all species' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all active species',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name_fr: { type: 'string' },
                            name_en: { type: 'string' },
                            name_ar: { type: 'string' },
                            icon: { type: 'string' },
                            display_order: { type: 'number' },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpeciesController.prototype, "findAll", null);
exports.SpeciesController = SpeciesController = __decorate([
    (0, swagger_1.ApiTags)('species'),
    (0, common_1.Controller)('api/v1/species'),
    __metadata("design:paramtypes", [species_service_1.SpeciesService])
], SpeciesController);
//# sourceMappingURL=species.controller.js.map