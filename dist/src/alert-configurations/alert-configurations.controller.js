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
exports.AlertConfigurationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alert_configurations_service_1 = require("./alert-configurations.service");
const dto_1 = require("./dto");
let AlertConfigurationsController = class AlertConfigurationsController {
    alertConfigurationsService;
    constructor(alertConfigurationsService) {
        this.alertConfigurationsService = alertConfigurationsService;
    }
    findAll(farmId, query) {
        return this.alertConfigurationsService.findAll(farmId, query);
    }
    findOne(farmId, id) {
        return this.alertConfigurationsService.findOne(farmId, id);
    }
    update(farmId, id, dto) {
        return this.alertConfigurationsService.update(farmId, id, dto);
    }
};
exports.AlertConfigurationsController = AlertConfigurationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List alert configurations' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryAlertConfigurationDto]),
    __metadata("design:returntype", void 0)
], AlertConfigurationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get alert configuration by ID' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AlertConfigurationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update alert configuration' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateAlertConfigurationDto]),
    __metadata("design:returntype", void 0)
], AlertConfigurationsController.prototype, "update", null);
exports.AlertConfigurationsController = AlertConfigurationsController = __decorate([
    (0, swagger_1.ApiTags)('Alert Configurations'),
    (0, common_1.Controller)('farms/:farmId/alert-configurations'),
    __metadata("design:paramtypes", [alert_configurations_service_1.AlertConfigurationsService])
], AlertConfigurationsController);
//# sourceMappingURL=alert-configurations.controller.js.map