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
exports.UpdateFarmPreferencesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateFarmPreferencesDto {
    defaultVeterinarianId;
    defaultSpeciesId;
    defaultBreedId;
    weightUnit;
    currency;
    language;
    dateFormat;
    enableNotifications;
    version;
}
exports.UpdateFarmPreferencesDto = UpdateFarmPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default veterinarian ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmPreferencesDto.prototype, "defaultVeterinarianId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default species ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmPreferencesDto.prototype, "defaultSpeciesId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Default breed ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmPreferencesDto.prototype, "defaultBreedId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Weight unit (kg, lb)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmPreferencesDto.prototype, "weightUnit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmPreferencesDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Language code', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmPreferencesDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date format', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFarmPreferencesDto.prototype, "dateFormat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enable notifications', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateFarmPreferencesDto.prototype, "enableNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateFarmPreferencesDto.prototype, "version", void 0);
//# sourceMappingURL=index.js.map