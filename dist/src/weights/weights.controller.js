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
exports.WeightsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const weights_service_1 = require("./weights.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
const farm_guard_1 = require("../auth/guards/farm.guard");
let WeightsController = class WeightsController {
    weightsService;
    constructor(weightsService) {
        this.weightsService = weightsService;
    }
    create(farmId, dto) {
        return this.weightsService.create(farmId, dto);
    }
    findAll(farmId, query) {
        return this.weightsService.findAll(farmId, query);
    }
    getAnimalHistory(farmId, animalId) {
        return this.weightsService.getAnimalWeightHistory(farmId, animalId);
    }
    findOne(farmId, id) {
        return this.weightsService.findOne(farmId, id);
    }
    update(farmId, id, dto) {
        return this.weightsService.update(farmId, id, dto);
    }
    remove(farmId, id) {
        return this.weightsService.remove(farmId, id);
    }
};
exports.WeightsController = WeightsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a weight record' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Weight created' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateWeightDto]),
    __metadata("design:returntype", void 0)
], WeightsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all weight records' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of weights' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryWeightDto]),
    __metadata("design:returntype", void 0)
], WeightsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('animal/:animalId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get weight history for an animal with gain calculation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weight history with daily gain' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('animalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WeightsController.prototype, "getAnimalHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a weight by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weight details' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WeightsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a weight' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weight updated' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateWeightDto]),
    __metadata("design:returntype", void 0)
], WeightsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a weight (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weight deleted' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WeightsController.prototype, "remove", null);
exports.WeightsController = WeightsController = __decorate([
    (0, swagger_1.ApiTags)('weights'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, farm_guard_1.FarmGuard),
    (0, common_1.Controller)('farms/:farmId/weights'),
    __metadata("design:paramtypes", [weights_service_1.WeightsService])
], WeightsController);
//# sourceMappingURL=weights.controller.js.map