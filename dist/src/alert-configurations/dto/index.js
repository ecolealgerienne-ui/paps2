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
exports.QueryAlertConfigurationDto = exports.UpdateAlertConfigurationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateAlertConfigurationDto {
    enabled;
    isEnabled;
    severity;
    daysBeforeDue;
    priority;
    version;
}
exports.UpdateAlertConfigurationDto = UpdateAlertConfigurationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is enabled', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAlertConfigurationDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is enabled (alternative)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAlertConfigurationDto.prototype, "isEnabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Severity level (1-10)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], UpdateAlertConfigurationDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days before due to alert', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateAlertConfigurationDto.prototype, "daysBeforeDue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Priority (low, medium, high)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAlertConfigurationDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAlertConfigurationDto.prototype, "version", void 0);
class QueryAlertConfigurationDto {
    type;
    category;
    enabled;
}
exports.QueryAlertConfigurationDto = QueryAlertConfigurationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by type', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAlertConfigurationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by category', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryAlertConfigurationDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter by enabled status', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryAlertConfigurationDto.prototype, "enabled", void 0);
//# sourceMappingURL=index.js.map