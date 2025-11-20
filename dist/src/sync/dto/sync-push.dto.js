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
exports.SyncPushDto = exports.SyncItemDto = exports.EntityType = exports.SyncAction = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var SyncAction;
(function (SyncAction) {
    SyncAction["CREATE"] = "create";
    SyncAction["UPDATE"] = "update";
    SyncAction["DELETE"] = "delete";
})(SyncAction || (exports.SyncAction = SyncAction = {}));
var EntityType;
(function (EntityType) {
    EntityType["ANIMAL"] = "animal";
    EntityType["LOT"] = "lot";
    EntityType["LOT_ANIMAL"] = "lot_animal";
    EntityType["TREATMENT"] = "treatment";
    EntityType["VACCINATION"] = "vaccination";
    EntityType["MOVEMENT"] = "movement";
    EntityType["WEIGHT"] = "weight";
    EntityType["BREEDING"] = "breeding";
    EntityType["CAMPAIGN"] = "campaign";
    EntityType["DOCUMENT"] = "document";
})(EntityType || (exports.EntityType = EntityType = {}));
class SyncItemDto {
    id;
    farmId;
    entityType;
    entityId;
    action;
    payload;
    clientTimestamp;
    clientVersion;
}
exports.SyncItemDto = SyncItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique ID for this queue item' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Farm ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncItemDto.prototype, "farmId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EntityType, description: 'Type of entity being synced' }),
    (0, class_validator_1.IsEnum)(EntityType),
    __metadata("design:type", String)
], SyncItemDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the entity' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SyncItemDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SyncAction, description: 'Action to perform' }),
    (0, class_validator_1.IsEnum)(SyncAction),
    __metadata("design:type", String)
], SyncItemDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity data payload' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SyncItemDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client timestamp when change was made' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SyncItemDto.prototype, "clientTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client version of the entity', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SyncItemDto.prototype, "clientVersion", void 0);
class SyncPushDto {
    items;
}
exports.SyncPushDto = SyncPushDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SyncItemDto], description: 'Items to sync' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SyncItemDto),
    __metadata("design:type", Array)
], SyncPushDto.prototype, "items", void 0);
//# sourceMappingURL=sync-push.dto.js.map