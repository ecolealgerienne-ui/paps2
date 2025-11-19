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
exports.MovementsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const movements_service_1 = require("./movements.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
const farm_guard_1 = require("../auth/guards/farm.guard");
let MovementsController = class MovementsController {
    movementsService;
    constructor(movementsService) {
        this.movementsService = movementsService;
    }
    create(farmId, dto) {
        return this.movementsService.create(farmId, dto);
    }
    findAll(farmId, query) {
        return this.movementsService.findAll(farmId, query);
    }
    getStatistics(farmId, fromDate, toDate) {
        return this.movementsService.getStatistics(farmId, fromDate, toDate);
    }
    findOne(farmId, id) {
        return this.movementsService.findOne(farmId, id);
    }
    update(farmId, id, dto) {
        return this.movementsService.update(farmId, id, dto);
    }
    remove(farmId, id) {
        return this.movementsService.remove(farmId, id);
    }
};
exports.MovementsController = MovementsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a movement (entry/exit/sale/etc.)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Movement created' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateMovementDto]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all movements' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of movements' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryMovementDto]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get movement statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Movement statistics' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a movement by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Movement details' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a movement' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Movement updated' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateMovementDto]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a movement (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Movement deleted' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MovementsController.prototype, "remove", null);
exports.MovementsController = MovementsController = __decorate([
    (0, swagger_1.ApiTags)('movements'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, farm_guard_1.FarmGuard),
    (0, common_1.Controller)('farms/:farmId/movements'),
    __metadata("design:paramtypes", [movements_service_1.MovementsService])
], MovementsController);
//# sourceMappingURL=movements.controller.js.map