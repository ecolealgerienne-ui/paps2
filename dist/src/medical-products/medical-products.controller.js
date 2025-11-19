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
exports.MedicalProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const medical_products_service_1 = require("./medical-products.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
let MedicalProductsController = class MedicalProductsController {
    medicalProductsService;
    constructor(medicalProductsService) {
        this.medicalProductsService = medicalProductsService;
    }
    create(dto) {
        return this.medicalProductsService.create(dto);
    }
    findAll(query) {
        return this.medicalProductsService.findAll(query);
    }
    findOne(id) {
        return this.medicalProductsService.findOne(id);
    }
    update(id, dto) {
        return this.medicalProductsService.update(id, dto);
    }
    remove(id) {
        return this.medicalProductsService.remove(id);
    }
};
exports.MedicalProductsController = MedicalProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a medical product' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Medical product created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMedicalProductDto]),
    __metadata("design:returntype", void 0)
], MedicalProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all medical products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of medical products' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryMedicalProductDto]),
    __metadata("design:returntype", void 0)
], MedicalProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a medical product by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Medical product details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a medical product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Medical product updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateMedicalProductDto]),
    __metadata("design:returntype", void 0)
], MedicalProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a medical product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Medical product deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalProductsController.prototype, "remove", null);
exports.MedicalProductsController = MedicalProductsController = __decorate([
    (0, swagger_1.ApiTags)('medical-products'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('medical-products'),
    __metadata("design:paramtypes", [medical_products_service_1.MedicalProductsService])
], MedicalProductsController);
//# sourceMappingURL=medical-products.controller.js.map