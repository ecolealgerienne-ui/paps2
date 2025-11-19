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
exports.AdministrationRoutesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const administration_routes_service_1 = require("./administration-routes.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
let AdministrationRoutesController = class AdministrationRoutesController {
    administrationRoutesService;
    constructor(administrationRoutesService) {
        this.administrationRoutesService = administrationRoutesService;
    }
    create(dto) {
        return this.administrationRoutesService.create(dto);
    }
    findAll() {
        return this.administrationRoutesService.findAll();
    }
    findOne(id) {
        return this.administrationRoutesService.findOne(id);
    }
    update(id, dto) {
        return this.administrationRoutesService.update(id, dto);
    }
    remove(id) {
        return this.administrationRoutesService.remove(id);
    }
};
exports.AdministrationRoutesController = AdministrationRoutesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create an administration route' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Administration route created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAdministrationRouteDto]),
    __metadata("design:returntype", void 0)
], AdministrationRoutesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all administration routes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of administration routes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdministrationRoutesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an administration route by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Administration route details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdministrationRoutesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an administration route' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Administration route updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAdministrationRouteDto]),
    __metadata("design:returntype", void 0)
], AdministrationRoutesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an administration route' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Administration route deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdministrationRoutesController.prototype, "remove", null);
exports.AdministrationRoutesController = AdministrationRoutesController = __decorate([
    (0, swagger_1.ApiTags)('administration-routes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('administration-routes'),
    __metadata("design:paramtypes", [administration_routes_service_1.AdministrationRoutesService])
], AdministrationRoutesController);
//# sourceMappingURL=administration-routes.controller.js.map