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
exports.QueryMovementDto = exports.UpdateMovementDto = exports.CreateMovementDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class CreateMovementDto {
    id;
    movementType;
    movementDate;
    animalIds;
    reason;
    buyerName;
    buyerType;
    buyerContact;
    salePrice;
    sellerName;
    purchasePrice;
    destinationFarmId;
    originFarmId;
    temporaryType;
    expectedReturnDate;
    documentNumber;
    notes;
}
exports.CreateMovementDto = CreateMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Movement ID (UUID)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.MovementType, description: 'Type of movement' }),
    (0, class_validator_1.IsEnum)(enums_1.MovementType),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "movementType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Movement date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "movementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Animal IDs involved in movement', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateMovementDto.prototype, "animalIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for movement', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "buyerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BuyerType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BuyerType),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "buyerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer contact', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "buyerContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sale price', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMovementDto.prototype, "salePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Seller name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "sellerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase price', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMovementDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Destination farm ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "destinationFarmId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Origin farm ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "originFarmId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.TemporaryMovementType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.TemporaryMovementType),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "temporaryType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expected return date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "expectedReturnDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "notes", void 0);
class UpdateMovementDto {
    movementType;
    movementDate;
    reason;
    buyerName;
    buyerType;
    buyerContact;
    salePrice;
    sellerName;
    purchasePrice;
    documentNumber;
    notes;
    version;
}
exports.UpdateMovementDto = UpdateMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.MovementType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.MovementType),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "movementType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Movement date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "movementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "buyerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.BuyerType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.BuyerType),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "buyerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer contact', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "buyerContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sale price', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMovementDto.prototype, "salePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Seller name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "sellerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Purchase price', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMovementDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMovementDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateMovementDto.prototype, "version", void 0);
class QueryMovementDto {
    movementType;
    status;
    fromDate;
    toDate;
    animalId;
    page;
    limit;
}
exports.QueryMovementDto = QueryMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.MovementType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.MovementType),
    __metadata("design:type", String)
], QueryMovementDto.prototype, "movementType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status (pending, completed, cancelled)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMovementDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'From date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryMovementDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'To date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryMovementDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMovementDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Page number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryMovementDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items per page', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], QueryMovementDto.prototype, "limit", void 0);
//# sourceMappingURL=index.js.map