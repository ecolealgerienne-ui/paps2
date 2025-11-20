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
exports.QueryWeightDto = exports.UpdateWeightDto = exports.CreateWeightDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class CreateWeightDto {
    id;
    animalId;
    weight;
    recordedAt;
    source;
    notes;
}
exports.CreateWeightDto = CreateWeightDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Weight ID (UUID)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWeightDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Animal ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWeightDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Weight in kg' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWeightDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when weight was recorded' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWeightDto.prototype, "recordedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.WeightSource, default: 'manual', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.WeightSource),
    __metadata("design:type", String)
], CreateWeightDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWeightDto.prototype, "notes", void 0);
class UpdateWeightDto {
    weight;
    recordedAt;
    source;
    notes;
    version;
}
exports.UpdateWeightDto = UpdateWeightDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Weight in kg', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateWeightDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when weight was recorded', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateWeightDto.prototype, "recordedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.WeightSource, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.WeightSource),
    __metadata("design:type", String)
], UpdateWeightDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWeightDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateWeightDto.prototype, "version", void 0);
class QueryWeightDto {
    animalId;
    source;
    fromDate;
    toDate;
}
exports.QueryWeightDto = QueryWeightDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryWeightDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.WeightSource, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.WeightSource),
    __metadata("design:type", String)
], QueryWeightDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryWeightDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryWeightDto.prototype, "toDate", void 0);
//# sourceMappingURL=index.js.map