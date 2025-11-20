"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const security_config_1 = require("../../common/config/security.config");
const logger_service_1 = require("../../common/utils/logger.service");
const exceptions_1 = require("../../common/exceptions");
const error_codes_1 = require("../../common/constants/error-codes");
let AuthGuard = AuthGuard_1 = class AuthGuard {
    logger = new logger_service_1.AppLogger(AuthGuard_1.name);
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (security_config_1.SecurityConfigService.isMvpMode()) {
            this.logger.debug('MVP Mode: Using fake dev user');
            const devUser = {
                userId: 'dev-user-001',
                email: 'dev@anitra.dz',
                farmIds: ['550e8400-e29b-41d4-a716-446655440000'],
                defaultFarmId: '550e8400-e29b-41d4-a716-446655440000',
                roles: ['farm_owner'],
            };
            request.user = devUser;
            this.logger.audit('User authenticated (MVP mode)', {
                userId: devUser.userId,
                farmIds: devUser.farmIds,
            });
            return true;
        }
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            this.logger.warn('Missing or invalid Authorization header');
            throw new exceptions_1.BusinessRuleException(error_codes_1.ERROR_CODES.UNAUTHORIZED, 'Missing or invalid Authorization header');
        }
        const token = authHeader.substring(7);
        try {
            this.logger.warn('JWT validation not implemented yet - rejecting request');
            throw new exceptions_1.BusinessRuleException(error_codes_1.ERROR_CODES.UNAUTHORIZED, 'Authentication not configured');
        }
        catch (error) {
            this.logger.error('JWT validation failed', error.stack);
            throw new exceptions_1.BusinessRuleException(error_codes_1.ERROR_CODES.INVALID_TOKEN, 'Invalid or expired token');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = AuthGuard_1 = __decorate([
    (0, common_1.Injectable)()
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map