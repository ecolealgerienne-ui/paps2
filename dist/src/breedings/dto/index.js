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
class CreateBreedingDto {
    id;
    femaleId;
    maleId;
    method;
    breedingDate;
    expectedDueDate;
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
    (0, swagger_1.ApiProperty)({ description: 'Female animal ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "femaleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Male animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "maleId", void 0);
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
    (0, swagger_1.ApiProperty)({ description: 'Expected due date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBreedingDto.prototype, "expectedDueDate", void 0);
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
    maleId;
    method;
    breedingDate;
    expectedDueDate;
    actualDueDate;
    status;
    offspringId;
    offspringCount;
    notes;
    version;
}
exports.UpdateBreedingDto = UpdateBreedingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Male animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "maleId", void 0);
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
    (0, swagger_1.ApiProperty)({ description: 'Expected due date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "expectedDueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actual due date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "actualDueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BreedingStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BreedingStatus),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Offspring animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBreedingDto.prototype, "offspringId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of offspring', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBreedingDto.prototype, "offspringCount", void 0);
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
    femaleId;
    status;
    fromDate;
    toDate;
}
exports.QueryBreedingDto = QueryBreedingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by female ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryBreedingDto.prototype, "femaleId", void 0);
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