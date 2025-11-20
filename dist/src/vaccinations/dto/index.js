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
class CreateVaccinationDto {
    id;
    animalId;
    animalIds;
    vaccineName;
    type;
    disease;
    veterinarianId;
    veterinarianName;
    vaccinationDate;
    nextDueDate;
    batchNumber;
    expiryDate;
    dose;
    administrationRoute;
    withdrawalPeriodDays;
    dosage;
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
    (0, swagger_1.ApiProperty)({ description: 'Animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Animal IDs (comma-separated or JSON string)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "animalIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccine name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "vaccineName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccination type (obligatoire, recommandee, optionnelle)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Disease' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "disease", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "veterinarianName", void 0);
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
    (0, swagger_1.ApiProperty)({ description: 'Expiry date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dose' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "dose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Administration route' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVaccinationDto.prototype, "administrationRoute", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal period in days' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVaccinationDto.prototype, "withdrawalPeriodDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVaccinationDto.prototype, "dosage", void 0);
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
    vaccineName;
    type;
    disease;
    veterinarianId;
    veterinarianName;
    vaccinationDate;
    nextDueDate;
    batchNumber;
    expiryDate;
    dose;
    administrationRoute;
    withdrawalPeriodDays;
    dosage;
    cost;
    notes;
    version;
}
exports.UpdateVaccinationDto = UpdateVaccinationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccine name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "vaccineName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vaccination type (obligatoire, recommandee, optionnelle)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Disease', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "disease", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "veterinarianName", void 0);
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
    (0, swagger_1.ApiProperty)({ description: 'Expiry date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dose', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "dose", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Administration route', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVaccinationDto.prototype, "administrationRoute", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal period in days', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVaccinationDto.prototype, "withdrawalPeriodDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dosage amount', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateVaccinationDto.prototype, "dosage", void 0);
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
    type;
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
    (0, swagger_1.ApiProperty)({ description: 'Filter by type (obligatoire, recommandee, optionnelle)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryVaccinationDto.prototype, "type", void 0);
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