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
exports.VaccinationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vaccinations_service_1 = require("./vaccinations.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
const farm_guard_1 = require("../auth/guards/farm.guard");
let VaccinationsController = class VaccinationsController {
    vaccinationsService;
    constructor(vaccinationsService) {
        this.vaccinationsService = vaccinationsService;
    }
    create(farmId, dto) {
        return this.vaccinationsService.create(farmId, dto);
    }
    findAll(farmId, query) {
        return this.vaccinationsService.findAll(farmId, query);
    }
    findOne(farmId, id) {
        return this.vaccinationsService.findOne(farmId, id);
    }
    update(farmId, id, dto) {
        return this.vaccinationsService.update(farmId, id, dto);
    }
    remove(farmId, id) {
        return this.vaccinationsService.remove(farmId, id);
    }
};
exports.VaccinationsController = VaccinationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a vaccination' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vaccination created' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateVaccinationDto]),
    __metadata("design:returntype", void 0)
], VaccinationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all vaccinations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of vaccinations' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryVaccinationDto]),
    __metadata("design:returntype", void 0)
], VaccinationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a vaccination by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vaccination details' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VaccinationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a vaccination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vaccination updated' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateVaccinationDto]),
    __metadata("design:returntype", void 0)
], VaccinationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a vaccination (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vaccination deleted' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VaccinationsController.prototype, "remove", null);
exports.VaccinationsController = VaccinationsController = __decorate([
    (0, swagger_1.ApiTags)('vaccinations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, farm_guard_1.FarmGuard),
    (0, common_1.Controller)('farms/:farmId/vaccinations'),
    __metadata("design:paramtypes", [vaccinations_service_1.VaccinationsService])
], VaccinationsController);
//# sourceMappingURL=vaccinations.controller.js.map