"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmGuard = void 0;
const common_1 = require("@nestjs/common");
let FarmGuard = class FarmGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const farmId = request.params.farmId || request.body.farmId || request.query.farmId;
        if (!farmId) {
            throw new common_1.ForbiddenException('farmId is required');
        }
        if (user.roles.includes('super_admin')) {
            return true;
        }
        if (!user.farmIds.includes(farmId)) {
            throw new common_1.ForbiddenException('Access denied to this farm');
        }
        return true;
    }
};
exports.FarmGuard = FarmGuard;
exports.FarmGuard = FarmGuard = __decorate([
    (0, common_1.Injectable)()
], FarmGuard);
//# sourceMappingURL=farm.guard.js.map