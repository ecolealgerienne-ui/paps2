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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const documents_service_1 = require("./documents.service");
const dto_1 = require("./dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
const farm_guard_1 = require("../auth/guards/farm.guard");
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    create(farmId, dto) {
        return this.documentsService.create(farmId, dto);
    }
    findAll(farmId, query) {
        return this.documentsService.findAll(farmId, query);
    }
    getExpiring(farmId, days) {
        return this.documentsService.getExpiringDocuments(farmId, days || 30);
    }
    getExpired(farmId) {
        return this.documentsService.getExpiredDocuments(farmId);
    }
    findOne(farmId, id) {
        return this.documentsService.findOne(farmId, id);
    }
    update(farmId, id, dto) {
        return this.documentsService.update(farmId, id, dto);
    }
    remove(farmId, id) {
        return this.documentsService.remove(farmId, id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a document' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document created' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of documents' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('expiring'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expiring documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of expiring documents' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getExpiring", null);
__decorate([
    (0, common_1.Get)('expired'),
    (0, swagger_1.ApiOperation)({ summary: 'Get expired documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of expired documents' }),
    __param(0, (0, common_1.Param)('farmId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getExpired", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a document by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document details' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a document' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document updated' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a document (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document deleted' }),
    __param(0, (0, common_1.Param)('farmId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "remove", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, farm_guard_1.FarmGuard),
    (0, common_1.Controller)('farms/:farmId/documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map