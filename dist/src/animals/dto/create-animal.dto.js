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
exports.CreateAnimalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateAnimalDto {
    id;
    farmId;
    farm_id;
    get normalizedFarmId() {
        return this.farmId || this.farm_id || '';
    }
    currentEid;
    officialNumber;
    visualId;
    birthDate;
    sex;
    motherId;
    speciesId;
    breedId;
    notes;
}
exports.CreateAnimalDto = CreateAnimalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID généré par le client' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la ferme (camelCase)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "farmId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la ferme (snake_case)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "farm_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'EID électronique (15 caractères max)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(15),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "currentEid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Numéro officiel' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "officialNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Identifiant visuel' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "visualId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date de naissance' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['male', 'female'] }),
    (0, class_validator_1.IsEnum)(['male', 'female']),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "sex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de la mère' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "motherId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID de l'espèce" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "speciesId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de la race' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "breedId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes (1000 caractères max)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "notes", void 0);
//# sourceMappingURL=create-animal.dto.js.map