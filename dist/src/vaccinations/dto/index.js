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
exports.QueryVaccinationDto = exports.UpdateVaccinationDto = exports.CreateVaccinationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class CreateVaccinationDto {
    id;
    animalId;
    vaccineId;
    veterinarianId;
    routeId;
    campaignId;
    vaccinationType;
    vaccinationDate;
    nextDueDate;
    batchNumber;
    dosage;
    dosageUnit;
    cost;
    notes;
}
exports.CreateVaccinationDto = CreateVaccinationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccination ID (UUID)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Animal ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccine ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "vaccineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Administration route ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "routeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Campaign ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "campaignId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.VaccinationType, description: 'Type of vaccination' }),
    (0, class_validator_1.IsEnum)(enums_1.VaccinationType),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "vaccinationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccination date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "vaccinationDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Next due date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "nextDueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Batch number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "batchNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVaccinationDto.prototype, "dosage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage unit', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "dosageUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVaccinationDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "notes", void 0);
class UpdateVaccinationDto {
    vaccineId;
    veterinarianId;
    routeId;
    vaccinationType;
    vaccinationDate;
    nextDueDate;
    batchNumber;
    dosage;
    dosageUnit;
    cost;
    notes;
    version;
}
exports.UpdateVaccinationDto = UpdateVaccinationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccine ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "vaccineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Administration route ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "routeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.VaccinationType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.VaccinationType),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "vaccinationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccination date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "vaccinationDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Next due date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "nextDueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Batch number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "batchNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVaccinationDto.prototype, "dosage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage unit', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "dosageUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cost', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVaccinationDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateVaccinationDto.prototype, "version", void 0);
class QueryVaccinationDto {
    animalId;
    vaccineId;
    vaccinationType;
    fromDate;
    toDate;
}
exports.QueryVaccinationDto = QueryVaccinationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryVaccinationDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by vaccine ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryVaccinationDto.prototype, "vaccineId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.VaccinationType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.VaccinationType),
    __metadata("design:type", String)
], QueryVaccinationDto.prototype, "vaccinationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryVaccinationDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryVaccinationDto.prototype, "toDate", void 0);
//# sourceMappingURL=index.js.map