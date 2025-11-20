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
exports.QueryBreedingDto = exports.UpdateBreedingDto = exports.CreateBreedingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
const class_transformer_1 = require("class-transformer");
class CreateBreedingDto {
    id;
    motherId;
    fatherId;
    fatherName;
    method;
    breedingDate;
    expectedBirthDate;
    expectedOffspringCount;
    veterinarianId;
    veterinarianName;
    status;
    notes;
}
exports.CreateBreedingDto = CreateBreedingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Breeding ID (UUID)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mother animal ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "motherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Father animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "fatherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Father name (for external males)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "fatherName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreedingMethod, description: 'Breeding method' }),
    (0, class_validator_1.IsEnum)(enums_1.BreedingMethod),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Breeding date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "breedingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected birth date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "expectedBirthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected offspring count', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBreedingDto.prototype, "expectedOffspringCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "veterinarianName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreedingStatus, default: 'planned', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BreedingStatus),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "notes", void 0);
class UpdateBreedingDto {
    fatherId;
    fatherName;
    method;
    breedingDate;
    expectedBirthDate;
    actualBirthDate;
    expectedOffspringCount;
    offspringIds;
    veterinarianId;
    status;
    notes;
    version;
}
exports.UpdateBreedingDto = UpdateBreedingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Father animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "fatherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Father name (for external males)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "fatherName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreedingMethod, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BreedingMethod),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Breeding date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "breedingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected birth date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "expectedBirthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actual birth date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "actualBirthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected offspring count', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBreedingDto.prototype, "expectedOffspringCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Offspring IDs (JSON array)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateBreedingDto.prototype, "offspringIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreedingStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BreedingStatus),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBreedingDto.prototype, "version", void 0);
class QueryBreedingDto {
    motherId;
    fatherId;
    status;
    fromDate;
    toDate;
}
exports.QueryBreedingDto = QueryBreedingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by mother ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryBreedingDto.prototype, "motherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by father ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryBreedingDto.prototype, "fatherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreedingStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BreedingStatus),
    __metadata("design:type", String)
], QueryBreedingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryBreedingDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryBreedingDto.prototype, "toDate", void 0);
//# sourceMappingURL=index.js.map