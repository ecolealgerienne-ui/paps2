"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertConfigurationsModule = void 0;
const common_1 = require("@nestjs/common");
const alert_configurations_controller_1 = require("./alert-configurations.controller");
const alert_configurations_service_1 = require("./alert-configurations.service");
const prisma_module_1 = require("../prisma/prisma.module");
let AlertConfigurationsModule = class AlertConfigurationsModule {
};
exports.AlertConfigurationsModule = AlertConfigurationsModule;
exports.AlertConfigurationsModule = AlertConfigurationsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [alert_configurations_controller_1.AlertConfigurationsController],
        providers: [alert_configurations_service_1.AlertConfigurationsService],
        exports: [alert_configurations_service_1.AlertConfigurationsService],
    })
], AlertConfigurationsModule);
//# sourceMappingURL=alert-configurations.module.js.map