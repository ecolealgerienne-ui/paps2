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
exports.FarmPreferencesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const farm_preferences_service_1 = require("./farm-preferences.service");
const dto_1 = require("./dto");
let FarmPreferencesController = class FarmPreferencesController {
    farmPreferencesService;
    constructor(farmPreferencesService) {
        this.farmPreferencesService = farmPreferencesService;
    }
    findOne(farmId) {
        return this.farmPreferencesService.findOne(farmId);
    }
    update(farmId, dto) {
        return this.farmPreferencesService.update(farmId, dto);
    }
};
exports.FarmPreferencesController = FarmPreferencesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get farm preferences' }),
    __param(0, (0, common_1.Param)('farmId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FarmPreferencesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update farm preferences' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateFarmPreferencesDto]),
    __metadata("design:returntype", void 0)
], FarmPreferencesController.prototype, "update", null);
exports.FarmPreferencesController = FarmPreferencesController = __decorate([
    (0, swagger_1.ApiTags)('Farm Preferences'),
    (0, common_1.Controller)('farms/:farmId/preferences'),
    __metadata("design:paramtypes", [farm_preferences_service_1.FarmPreferencesService])
], FarmPreferencesController);
//# sourceMappingURL=farm-preferences.controller.js.map