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
exports.VaccinesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vaccines_service_1 = require("./vaccines.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
let VaccinesController = class VaccinesController {
    vaccinesService;
    constructor(vaccinesService) {
        this.vaccinesService = vaccinesService;
    }
    create(farmId, dto) {
        return this.vaccinesService.create(farmId, dto);
    }
    findAll(farmId, query) {
        return this.vaccinesService.findAll(farmId, query);
    }
    findOne(farmId, id) {
        return this.vaccinesService.findOne(farmId, id);
    }
    update(farmId, id, dto) {
        return this.vaccinesService.update(farmId, id, dto);
    }
    remove(farmId, id) {
        return this.vaccinesService.remove(farmId, id);
    }
};
exports.VaccinesController = VaccinesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a vaccine' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vaccine created' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateVaccineDto]),
    __metadata("design:returntype", void 0)
], VaccinesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all vaccines' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of vaccines' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryVaccineDto]),
    __metadata("design:returntype", void 0)
], VaccinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a vaccine by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vaccine details' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VaccinesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a vaccine' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vaccine updated' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateVaccineDto]),
    __metadata("design:returntype", void 0)
], VaccinesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a vaccine' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vaccine deleted' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VaccinesController.prototype, "remove", null);
exports.VaccinesController = VaccinesController = __decorate([
    (0, swagger_1.ApiTags)('vaccines'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('farms/:farmId/vaccines'),
    __metadata("design:paramtypes", [vaccines_service_1.VaccinesService])
], VaccinesController);
//# sourceMappingURL=vaccines.controller.js.map