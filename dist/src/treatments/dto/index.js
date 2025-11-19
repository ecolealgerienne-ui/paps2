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
exports.QueryTreatmentDto = exports.UpdateTreatmentDto = exports.CreateTreatmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class CreateTreatmentDto {
    id;
    animalId;
    productId;
    productName;
    veterinarianId;
    veterinarianName;
    campaignId;
    routeId;
    diagnosis;
    treatmentDate;
    dose;
    dosage;
    dosageUnit;
    duration;
    status;
    withdrawalEndDate;
    cost;
    notes;
}
exports.CreateTreatmentDto = CreateTreatmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Treatment ID (UUID)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Animal ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Medical product ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "veterinarianName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Administration route ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "routeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Diagnosis', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Treatment date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "treatmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dose amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "dose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "dosage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage unit (ml, mg, etc.)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "dosageUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration in days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.TreatmentStatus, default: 'completed', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.TreatmentStatus),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal end date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "withdrawalEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "notes", void 0);
class UpdateTreatmentDto {
    productId;
    productName;
    veterinarianId;
    veterinarianName;
    campaignId;
    routeId;
    diagnosis;
    treatmentDate;
    dose;
    dosage;
    dosageUnit;
    duration;
    status;
    withdrawalEndDate;
    cost;
    notes;
    version;
}
exports.UpdateTreatmentDto = UpdateTreatmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Medical product ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "veterinarianName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Administration route ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "routeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Diagnosis', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Treatment date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "treatmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dose amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTreatmentDto.prototype, "dose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTreatmentDto.prototype, "dosage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage unit', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "dosageUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration in days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTreatmentDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.TreatmentStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.TreatmentStatus),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal end date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "withdrawalEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTreatmentDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTreatmentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateTreatmentDto.prototype, "version", void 0);
class QueryTreatmentDto {
    animalId;
    status;
    fromDate;
    toDate;
}
exports.QueryTreatmentDto = QueryTreatmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryTreatmentDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.TreatmentStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.TreatmentStatus),
    __metadata("design:type", String)
], QueryTreatmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryTreatmentDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryTreatmentDto.prototype, "toDate", void 0);
//# sourceMappingURL=index.js.map