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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreedsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const breeds_service_1 = require("./breeds.service");
let BreedsController = class BreedsController {
    breedsService;
    constructor(breedsService) {
        this.breedsService = breedsService;
    }
    async findAll(speciesId) {
        const breeds = await this.breedsService.findAll(speciesId);
        return {
            success: true,
            data: breeds.map(b => ({
                id: b.id,
                species_id: b.speciesId,
                name_fr: b.nameFr,
                name_en: b.nameEn,
                name_ar: b.nameAr,
                description: b.description,
                display_order: b.displayOrder,
                is_active: b.isActive,
            })),
        };
    }
};
exports.BreedsController = BreedsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all breeds, optionally filtered by species' }),
    (0, swagger_1.ApiQuery)({
        name: 'speciesId',
        required: false,
        type: String,
        description: 'Filter breeds by species ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all active breeds',
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
                            species_id: { type: 'string' },
                            name_fr: { type: 'string' },
                            name_en: { type: 'string' },
                            name_ar: { type: 'string' },
                            description: { type: 'string' },
                            display_order: { type: 'number' },
                            is_active: { type: 'boolean' },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('speciesId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BreedsController.prototype, "findAll", null);
exports.BreedsController = BreedsController = __decorate([
    (0, swagger_1.ApiTags)('breeds'),
    (0, common_1.Controller)('api/v1/breeds'),
    __metadata("design:paramtypes", [breeds_service_1.BreedsService])
], BreedsController);
//# sourceMappingURL=breeds.controller.js.map