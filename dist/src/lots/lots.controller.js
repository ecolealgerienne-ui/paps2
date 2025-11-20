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
exports.LotsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lots_service_1 = require("./lots.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
const farm_guard_1 = require("../auth/guards/farm.guard");
let LotsController = class LotsController {
    lotsService;
    constructor(lotsService) {
        this.lotsService = lotsService;
    }
    create(farmId, dto) {
        return this.lotsService.create(farmId, dto);
    }
    findAll(farmId, query) {
        return this.lotsService.findAll(farmId, query);
    }
    findOne(farmId, id) {
        return this.lotsService.findOne(farmId, id);
    }
    update(farmId, id, dto) {
        return this.lotsService.update(farmId, id, dto);
    }
    remove(farmId, id) {
        return this.lotsService.remove(farmId, id);
    }
    addAnimals(farmId, id, dto) {
        return this.lotsService.addAnimals(farmId, id, dto);
    }
    removeAnimals(farmId, id, dto) {
        return this.lotsService.removeAnimals(farmId, id, dto.animalIds);
    }
};
exports.LotsController = LotsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a lot' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Lot created' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateLotDto]),
    __metadata("design:returntype", void 0)
], LotsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all lots' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of lots' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryLotDto]),
    __metadata("design:returntype", void 0)
], LotsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a lot by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lot details with animals' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LotsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a lot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lot updated' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateLotDto]),
    __metadata("design:returntype", void 0)
], LotsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a lot (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lot deleted' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LotsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/animals'),
    (0, swagger_1.ApiOperation)({ summary: 'Add animals to lot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Animals added' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.AddAnimalsToLotDto]),
    __metadata("design:returntype", void 0)
], LotsController.prototype, "addAnimals", null);
__decorate([
    (0, common_1.Delete)(':id/animals'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove animals from lot' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Animals removed' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.AddAnimalsToLotDto]),
    __metadata("design:returntype", void 0)
], LotsController.prototype, "removeAnimals", null);
exports.LotsController = LotsController = __decorate([
    (0, swagger_1.ApiTags)('lots'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, farm_guard_1.FarmGuard),
    (0, common_1.Controller)('farms/:farmId/lots'),
    __metadata("design:paramtypes", [lots_service_1.LotsService])
], LotsController);
//# sourceMappingURL=lots.controller.js.map