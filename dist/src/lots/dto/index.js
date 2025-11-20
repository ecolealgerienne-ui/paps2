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
exports.AddAnimalsToLotDto = exports.QueryLotDto = exports.UpdateLotDto = exports.CreateLotDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class CreateLotDto {
    id;
    name;
    type;
    status;
    productId;
    productName;
    treatmentDate;
    withdrawalEndDate;
    veterinarianId;
    veterinarianName;
    priceTotal;
    buyerName;
    sellerName;
    description;
    notes;
    isActive;
}
exports.CreateLotDto = CreateLotDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lot ID (UUID)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lot name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.LotType, description: 'Type of lot', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.LotType),
    __metadata("design:type", String)
], CreateLotDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status (open, closed, archived)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Treatment date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "treatmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal end date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "withdrawalEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "veterinarianName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total price', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLotDto.prototype, "priceTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "buyerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Seller name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "sellerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLotDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is lot active', default: true, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateLotDto.prototype, "isActive", void 0);
class UpdateLotDto {
    name;
    type;
    status;
    productId;
    productName;
    treatmentDate;
    withdrawalEndDate;
    veterinarianId;
    veterinarianName;
    priceTotal;
    buyerName;
    sellerName;
    description;
    notes;
    isActive;
    completed;
    version;
}
exports.UpdateLotDto = UpdateLotDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lot name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.LotType, description: 'Type of lot', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.LotType),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "productName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Treatment date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "treatmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Withdrawal end date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "withdrawalEndDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "veterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Veterinarian name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "veterinarianName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total price', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLotDto.prototype, "priceTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "buyerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Seller name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "sellerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLotDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is lot active', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLotDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is completed', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateLotDto.prototype, "completed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLotDto.prototype, "version", void 0);
class QueryLotDto {
    type;
    status;
    completed;
    isActive;
    search;
}
exports.QueryLotDto = QueryLotDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.LotType, description: 'Filter by type', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.LotType),
    __metadata("design:type", String)
], QueryLotDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by status (open, closed, archived)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLotDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by completed', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryLotDto.prototype, "completed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by active status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryLotDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search by name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryLotDto.prototype, "search", void 0);
class AddAnimalsToLotDto {
    animalIds;
}
exports.AddAnimalsToLotDto = AddAnimalsToLotDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of animal IDs to add', type: [String] }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AddAnimalsToLotDto.prototype, "animalIds", void 0);
//# sourceMappingURL=index.js.map