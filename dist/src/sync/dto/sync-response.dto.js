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
exports.SyncPullResponseDto = exports.SyncChangeDto = exports.SyncPushResponseDto = exports.SyncItemResultDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SyncItemResultDto {
    id;
    entityId;
    status;
    newVersion;
    serverData;
    serverVersion;
    errorMessage;
}
exports.SyncItemResultDto = SyncItemResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Queue item ID' }),
    __metadata("design:type", String)
], SyncItemResultDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity ID' }),
    __metadata("design:type", String)
], SyncItemResultDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sync status', enum: ['synced', 'conflict', 'failed'] }),
    __metadata("design:type", String)
], SyncItemResultDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New version after sync', required: false }),
    __metadata("design:type", Number)
], SyncItemResultDto.prototype, "newVersion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Server data in case of conflict', required: false }),
    __metadata("design:type", Object)
], SyncItemResultDto.prototype, "serverData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Server version in case of conflict', required: false }),
    __metadata("design:type", Number)
], SyncItemResultDto.prototype, "serverVersion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message if failed', required: false }),
    __metadata("design:type", String)
], SyncItemResultDto.prototype, "errorMessage", void 0);
class SyncPushResponseDto {
    results;
    serverTimestamp;
    summary;
}
exports.SyncPushResponseDto = SyncPushResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Results for each sync item', type: [SyncItemResultDto] }),
    __metadata("design:type", Array)
], SyncPushResponseDto.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Server timestamp of this sync' }),
    __metadata("design:type", String)
], SyncPushResponseDto.prototype, "serverTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Summary of sync results' }),
    __metadata("design:type", Object)
], SyncPushResponseDto.prototype, "summary", void 0);
class SyncChangeDto {
    entityType;
    entityId;
    action;
    data;
    version;
    updatedAt;
}
exports.SyncChangeDto = SyncChangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity type' }),
    __metadata("design:type", String)
], SyncChangeDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity ID' }),
    __metadata("design:type", String)
], SyncChangeDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action performed', enum: ['create', 'update', 'delete'] }),
    __metadata("design:type", String)
], SyncChangeDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Entity data' }),
    __metadata("design:type", Object)
], SyncChangeDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version of the entity' }),
    __metadata("design:type", Number)
], SyncChangeDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the change' }),
    __metadata("design:type", String)
], SyncChangeDto.prototype, "updatedAt", void 0);
class SyncPullResponseDto {
    changes;
    serverTimestamp;
    hasMore;
}
exports.SyncPullResponseDto = SyncPullResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Changes since last sync', type: [SyncChangeDto] }),
    __metadata("design:type", Array)
], SyncPullResponseDto.prototype, "changes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Server timestamp for next sync' }),
    __metadata("design:type", String)
], SyncPullResponseDto.prototype, "serverTimestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether there are more changes to pull' }),
    __metadata("design:type", Boolean)
], SyncPullResponseDto.prototype, "hasMore", void 0);
//# sourceMappingURL=sync-response.dto.js.map