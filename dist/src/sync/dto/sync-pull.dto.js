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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncPullQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const sync_push_dto_1 = require("./sync-push.dto");
class SyncPullQueryDto {
    farmId;
    since;
    entityTypes;
}
exports.SyncPullQueryDto = SyncPullQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Farm ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncPullQueryDto.prototype, "farmId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last sync timestamp', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SyncPullQueryDto.prototype, "since", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: sync_push_dto_1.EntityType,
        isArray: true,
        description: 'Entity types to pull (all if not specified)',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(sync_push_dto_1.EntityType, { each: true }),
    __metadata("design:type", Array)
], SyncPullQueryDto.prototype, "entityTypes", void 0);
//# sourceMappingURL=sync-pull.dto.js.map