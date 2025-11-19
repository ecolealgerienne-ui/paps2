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
exports.VeterinariansController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const veterinarians_service_1 = require("./veterinarians.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
let VeterinariansController = class VeterinariansController {
    veterinariansService;
    constructor(veterinariansService) {
        this.veterinariansService = veterinariansService;
    }
    create(dto) {
        return this.veterinariansService.create(dto);
    }
    findAll(query) {
        return this.veterinariansService.findAll(query);
    }
    findOne(id) {
        return this.veterinariansService.findOne(id);
    }
    update(id, dto) {
        return this.veterinariansService.update(id, dto);
    }
    remove(id) {
        return this.veterinariansService.remove(id);
    }
};
exports.VeterinariansController = VeterinariansController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a veterinarian' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Veterinarian created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateVeterinarianDto]),
    __metadata("design:returntype", void 0)
], VeterinariansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all veterinarians' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of veterinarians' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryVeterinarianDto]),
    __metadata("design:returntype", void 0)
], VeterinariansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a veterinarian by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Veterinarian details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VeterinariansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a veterinarian' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Veterinarian updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateVeterinarianDto]),
    __metadata("design:returntype", void 0)
], VeterinariansController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a veterinarian' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Veterinarian deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VeterinariansController.prototype, "remove", null);
exports.VeterinariansController = VeterinariansController = __decorate([
    (0, swagger_1.ApiTags)('veterinarians'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('veterinarians'),
    __metadata("design:paramtypes", [veterinarians_service_1.VeterinariansService])
], VeterinariansController);
//# sourceMappingURL=veterinarians.controller.js.map