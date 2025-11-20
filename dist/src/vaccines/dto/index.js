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
exports.QueryVaccineDto = exports.UpdateVaccineDto = exports.CreateVaccineDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateVaccineDto {
    name;
    description;
    manufacturer;
    targetSpecies;
    targetDiseases;
    standardDose;
    injectionsRequired;
    injectionIntervalDays;
    meatWithdrawalDays;
    milkWithdrawalDays;
    administrationRoute;
    isActive;
}
exports.CreateVaccineDto = CreateVaccineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccine name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccineDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccineDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Manufacturer', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccineDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target species (JSON array)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateVaccineDto.prototype, "targetSpecies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target diseases (JSON array)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateVaccineDto.prototype, "targetDiseases", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Standard dose', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVaccineDto.prototype, "standardDose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of injections required', required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateVaccineDto.prototype, "injectionsRequired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interval between injections (days)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVaccineDto.prototype, "injectionIntervalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Meat withdrawal days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVaccineDto.prototype, "meatWithdrawalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Milk withdrawal days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVaccineDto.prototype, "milkWithdrawalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Administration route', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccineDto.prototype, "administrationRoute", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active', required: false, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVaccineDto.prototype, "isActive", void 0);
class UpdateVaccineDto {
    name;
    description;
    manufacturer;
    targetSpecies;
    targetDiseases;
    standardDose;
    injectionsRequired;
    injectionIntervalDays;
    meatWithdrawalDays;
    milkWithdrawalDays;
    administrationRoute;
    isActive;
}
exports.UpdateVaccineDto = UpdateVaccineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccine name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccineDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccineDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Manufacturer', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccineDto.prototype, "manufacturer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target species (JSON array)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateVaccineDto.prototype, "targetSpecies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target diseases (JSON array)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateVaccineDto.prototype, "targetDiseases", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Standard dose', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVaccineDto.prototype, "standardDose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of injections required', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateVaccineDto.prototype, "injectionsRequired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Interval between injections (days)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVaccineDto.prototype, "injectionIntervalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Meat withdrawal days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVaccineDto.prototype, "meatWithdrawalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Milk withdrawal days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVaccineDto.prototype, "milkWithdrawalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Administration route', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccineDto.prototype, "administrationRoute", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateVaccineDto.prototype, "isActive", void 0);
class QueryVaccineDto {
    search;
    isActive;
}
exports.QueryVaccineDto = QueryVaccineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search by name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryVaccineDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by active status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryVaccineDto.prototype, "isActive", void 0);
//# sourceMappingURL=index.js.map