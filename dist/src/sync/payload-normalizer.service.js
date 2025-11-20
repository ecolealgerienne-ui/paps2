"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadNormalizerService = void 0;
const common_1 = require("@nestjs/common");
const enum_converter_1 = require("../common/utils/enum-converter");
let PayloadNormalizerService = class PayloadNormalizerService {
    normalize(entityType, payload) {
        if (!payload || typeof payload !== 'object') {
            return payload;
        }
        let normalized = { ...payload };
        if (entityType === 'animal') {
            if (payload.farm_id && !payload.farmId) {
                normalized.farmId = payload.farm_id;
                delete normalized.farm_id;
            }
        }
        if (entityType === 'lot' && payload.animalIds) {
            normalized._animalIds = payload.animalIds;
            delete normalized.animalIds;
        }
        if (entityType === 'campaign' && payload.animalIds) {
            normalized.animalIdsJson = JSON.stringify(payload.animalIds);
            delete normalized.animalIds;
        }
        normalized = this.convertEnums(entityType, normalized);
        normalized = this.convertDates(normalized);
        delete normalized.synced;
        delete normalized.last_synced_at;
        delete normalized.server_version;
        return normalized;
    }
    convertDates(payload) {
        const dateFields = [
            'birthDate', 'birth_date',
            'startDate', 'start_date',
            'endDate', 'end_date',
            'plannedEndDate', 'planned_end_date',
            'actualEndDate', 'actual_end_date',
            'breedingDate', 'breeding_date',
            'expectedBirthDate', 'expected_birth_date',
            'actualBirthDate', 'actual_birth_date',
            'movementDate', 'movement_date',
            'returnDate', 'return_date',
            'weightDate', 'weight_date',
            'treatmentDate', 'treatment_date',
            'vaccinationDate', 'vaccination_date',
            'issueDate', 'issue_date',
            'expiryDate', 'expiry_date',
        ];
        for (const field of dateFields) {
            if (payload[field] && typeof payload[field] === 'string') {
                payload[field] = new Date(payload[field]);
            }
        }
        return payload;
    }
    convertEnums(entityType, payload) {
        switch (entityType) {
            case 'movement':
                if (payload.movementType) {
                    payload.movementType = (0, enum_converter_1.convertEnumValue)('movement_type', payload.movementType);
                }
                if (payload.temporaryType) {
                    payload.temporaryType = (0, enum_converter_1.convertEnumValue)('temporary_type', payload.temporaryType);
                }
                break;
            case 'breeding':
                if (payload.breedingMethod) {
                    payload.breedingMethod = (0, enum_converter_1.convertEnumValue)('breeding_method', payload.breedingMethod);
                }
                break;
            case 'document':
                if (payload.documentType) {
                    payload.documentType = (0, enum_converter_1.convertEnumValue)('document_type', payload.documentType);
                }
                break;
            case 'animal':
                if (payload.status) {
                    payload.status = (0, enum_converter_1.convertEnumValue)('animal_status', payload.status);
                }
                break;
        }
        return payload;
    }
    denormalize(entityType, data) {
        return data;
    }
};
exports.PayloadNormalizerService = PayloadNormalizerService;
exports.PayloadNormalizerService = PayloadNormalizerService = __decorate([
    (0, common_1.Injectable)()
], PayloadNormalizerService);
//# sourceMappingURL=payload-normalizer.service.js.map