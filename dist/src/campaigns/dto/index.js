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
exports.QueryCampaignDto = exports.UpdateCampaignDto = exports.CreateCampaignDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class CreateCampaignDto {
    id;
    name;
    productId;
    productName;
    type;
    lotId;
    campaignDate;
    withdrawalEndDate;
    veterinarianId;
    veterinarianName;
    animalIdsJson;
    startDate;
    endDate;
    targetCount;
    status;
    notes;
}
exports.CreateCampaignDto = CreateCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign ID (UUID)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.CampaignType, description: 'Type of campaign', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.CampaignType),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lot ID to target', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "lotId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "campaignDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal end date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "withdrawalEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "veterinarianName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Animal IDs (JSON string)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "animalIdsJson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target animal count', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCampaignDto.prototype, "targetCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.CampaignStatus, default: 'planned', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.CampaignStatus),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampaignDto.prototype, "notes", void 0);
class UpdateCampaignDto {
    name;
    type;
    lotId;
    startDate;
    endDate;
    targetCount;
    completedCount;
    status;
    notes;
    version;
}
exports.UpdateCampaignDto = UpdateCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.CampaignType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.CampaignType),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lot ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "lotId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target count', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCampaignDto.prototype, "targetCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Completed count', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCampaignDto.prototype, "completedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.CampaignStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.CampaignStatus),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCampaignDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCampaignDto.prototype, "version", void 0);
class QueryCampaignDto {
    type;
    status;
    fromDate;
    toDate;
}
exports.QueryCampaignDto = QueryCampaignDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.CampaignType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.CampaignType),
    __metadata("design:type", String)
], QueryCampaignDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.CampaignStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.CampaignStatus),
    __metadata("design:type", String)
], QueryCampaignDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryCampaignDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryCampaignDto.prototype, "toDate", void 0);
//# sourceMappingURL=index.js.map