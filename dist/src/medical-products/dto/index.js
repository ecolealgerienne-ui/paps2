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
exports.QueryMedicalProductDto = exports.UpdateMedicalProductDto = exports.CreateMedicalProductDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateMedicalProductDto {
    name;
    activeSubstance;
    manufacturer;
    withdrawalPeriodMeat;
    withdrawalPeriodMilk;
    dosageUnit;
    isActive;
}
exports.CreateMedicalProductDto = CreateMedicalProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicalProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Active substance', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicalProductDto.prototype, "activeSubstance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Manufacturer', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicalProductDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal period for meat (days)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMedicalProductDto.prototype, "withdrawalPeriodMeat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal period for milk (days)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMedicalProductDto.prototype, "withdrawalPeriodMilk", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage unit', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMedicalProductDto.prototype, "dosageUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active', required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMedicalProductDto.prototype, "isActive", void 0);
class UpdateMedicalProductDto {
    name;
    activeSubstance;
    manufacturer;
    withdrawalPeriodMeat;
    withdrawalPeriodMilk;
    dosageUnit;
    isActive;
}
exports.UpdateMedicalProductDto = UpdateMedicalProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMedicalProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Active substance', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMedicalProductDto.prototype, "activeSubstance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Manufacturer', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMedicalProductDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal period for meat (days)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateMedicalProductDto.prototype, "withdrawalPeriodMeat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal period for milk (days)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateMedicalProductDto.prototype, "withdrawalPeriodMilk", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage unit', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMedicalProductDto.prototype, "dosageUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMedicalProductDto.prototype, "isActive", void 0);
class QueryMedicalProductDto {
    search;
    isActive;
}
exports.QueryMedicalProductDto = QueryMedicalProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search by name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMedicalProductDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by active status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryMedicalProductDto.prototype, "isActive", void 0);
//# sourceMappingURL=index.js.map