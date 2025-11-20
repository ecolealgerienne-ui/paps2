"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FarmGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmGuard = void 0;
const common_1 = require("@nestjs/common");
const security_config_1 = require("../../common/config/security.config");
const logger_service_1 = require("../../common/utils/logger.service");
const exceptions_1 = require("../../common/exceptions");
const error_codes_1 = require("../../common/constants/error-codes");
let FarmGuard = FarmGuard_1 = class FarmGuard {
    logger = new logger_service_1.AppLogger(FarmGuard_1.name);
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const farmId = request.params.farmId || request.body.farmId || request.query.farmId;
        if (!farmId) {
            this.logger.warn('Request missing farmId', {
                userId: user?.userId,
                path: request.path,
            });
            throw new exceptions_1.BusinessRuleException(error_codes_1.ERROR_CODES.FARM_ID_REQUIRED, 'farmId is required', { userId: user?.userId });
        }
        if (!security_config_1.SecurityConfigService.isFarmValidationEnabled()) {
            this.logger.debug('MVP Mode: Skipping farm access validation', {
                userId: user?.userId,
                farmId,
            });
            return true;
        }
        if (user.roles.includes('super_admin')) {
            this.logger.audit('Farm access granted (super_admin)', {
                userId: user.userId,
                farmId,
            });
            return true;
        }
        if (!user.farmIds.includes(farmId)) {
            this.logger.warn('Farm access denied', {
                userId: user.userId,
                requestedFarmId: farmId,
                userFarmIds: user.farmIds,
            });
            throw new exceptions_1.BusinessRuleException(error_codes_1.ERROR_CODES.FARM_ACCESS_DENIED, 'Access denied to this farm', {
                userId: user.userId,
                farmId,
            });
        }
        this.logger.audit('Farm access granted', {
            userId: user.userId,
            farmId,
        });
        return true;
    }
};
exports.FarmGuard = FarmGuard;
exports.FarmGuard = FarmGuard = FarmGuard_1 = __decorate([
    (0, common_1.Injectable)()
], FarmGuard);
//# sourceMappingURL=farm.guard.js.map