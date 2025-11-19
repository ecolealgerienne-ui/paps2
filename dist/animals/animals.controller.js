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
exports.AnimalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/guards/auth.guard");
const farm_guard_1 = require("../auth/guards/farm.guard");
const animals_service_1 = require("./animals.service");
const dto_1 = require("./dto");
let AnimalsController = class AnimalsController {
    animalsService;
    constructor(animalsService) {
        this.animalsService = animalsService;
    }
    create(farmId, createAnimalDto) {
        return this.animalsService.create({ ...createAnimalDto, farmId });
    }
    findAll(farmId, query) {
        return this.animalsService.findAll(farmId, query);
    }
    findOne(farmId, id) {
        return this.animalsService.findOne(farmId, id);
    }
    update(farmId, id, updateAnimalDto) {
        return this.animalsService.update(farmId, id, updateAnimalDto);
    }
    remove(farmId, id) {
        return this.animalsService.remove(farmId, id);
    }
};
exports.AnimalsController = AnimalsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un animal' }),
    (0, swagger_1.ApiParam)({ name: 'farmId', description: 'ID de la ferme' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateAnimalDto]),
    __metadata("design:returntype", void 0)
], AnimalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des animaux' }),
    (0, swagger_1.ApiParam)({ name: 'farmId', description: 'ID de la ferme' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryAnimalDto]),
    __metadata("design:returntype", void 0)
], AnimalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: "Détail d'un animal" }),
    (0, swagger_1.ApiParam)({ name: 'farmId', description: 'ID de la ferme' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: "ID de l'animal" }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnimalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un animal' }),
    (0, swagger_1.ApiParam)({ name: 'farmId', description: 'ID de la ferme' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: "ID de l'animal" }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateAnimalDto]),
    __metadata("design:returntype", void 0)
], AnimalsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un animal (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'farmId', description: 'ID de la ferme' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: "ID de l'animal" }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnimalsController.prototype, "remove", null);
exports.AnimalsController = AnimalsController = __decorate([
    (0, swagger_1.ApiTags)('Animals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('farms/:farmId/animals'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, farm_guard_1.FarmGuard),
    __metadata("design:paramtypes", [animals_service_1.AnimalsService])
], AnimalsController);
//# sourceMappingURL=animals.controller.js.map