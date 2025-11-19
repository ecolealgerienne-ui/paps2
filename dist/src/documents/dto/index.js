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
exports.QueryDocumentDto = exports.UpdateDocumentDto = exports.CreateDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../../common/enums");
class CreateDocumentDto {
    id;
    animalId;
    type;
    title;
    fileName;
    fileUrl;
    fileSizeBytes;
    mimeType;
    uploadDate;
    uploadedBy;
    documentNumber;
    issueDate;
    expiryDate;
    notes;
}
exports.CreateDocumentDto = CreateDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document ID (UUID)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.DocumentType, description: 'Type of document' }),
    (0, class_validator_1.IsEnum)(enums_1.DocumentType),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document title', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateDocumentDto.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload date' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "uploadDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Uploaded by user ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "uploadedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Issue date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiry date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "notes", void 0);
class UpdateDocumentDto {
    animalId;
    type;
    title;
    fileName;
    fileUrl;
    fileSizeBytes;
    mimeType;
    uploadDate;
    uploadedBy;
    documentNumber;
    issueDate;
    expiryDate;
    notes;
    version;
}
exports.UpdateDocumentDto = UpdateDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Animal ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "animalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.DocumentType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.DocumentType),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document title', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File URL', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File size in bytes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateDocumentDto.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upload date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "uploadDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Uploaded by user ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "uploadedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Document number', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "documentNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Issue date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Expiry date', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDocumentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Version for conflict detection', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDocumentDto.prototype, "version", void 0);
class QueryDocumentDto {
    type;
    search;
    expiringSoon;
}
exports.QueryDocumentDto = QueryDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.DocumentType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.DocumentType),
    __metadata("design:type", String)
], QueryDocumentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search by title', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryDocumentDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Only expiring soon', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], QueryDocumentDto.prototype, "expiringSoon", void 0);
//# sourceMappingURL=index.js.map