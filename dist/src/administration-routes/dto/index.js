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
exports.UpdateAdministrationRouteDto = exports.CreateAdministrationRouteDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateAdministrationRouteDto {
    id;
    nameFr;
    nameEn;
    nameAr;
    displayOrder;
}
exports.CreateAdministrationRouteDto = CreateAdministrationRouteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Route ID (e.g., IM, IV, SC, PO)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdministrationRouteDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name in French' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdministrationRouteDto.prototype, "nameFr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name in English' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdministrationRouteDto.prototype, "nameEn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name in Arabic' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdministrationRouteDto.prototype, "nameAr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display order', required: false, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAdministrationRouteDto.prototype, "displayOrder", void 0);
class UpdateAdministrationRouteDto {
    nameFr;
    nameEn;
    nameAr;
    displayOrder;
}
exports.UpdateAdministrationRouteDto = UpdateAdministrationRouteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name in French', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdministrationRouteDto.prototype, "nameFr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name in English', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdministrationRouteDto.prototype, "nameEn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name in Arabic', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAdministrationRouteDto.prototype, "nameAr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Display order', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAdministrationRouteDto.prototype, "displayOrder", void 0);
//# sourceMappingURL=index.js.map