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
const case_converter_1 = require("../common/utils/case-converter");
const enum_converter_1 = require("../common/utils/enum-converter");
let PayloadNormalizerService = class PayloadNormalizerService {
    normalize(entityType, payload) {
        if (!payload || typeof payload !== 'object') {
            return payload;
        }
        let normalized = { ...payload };
        const camelCaseEntities = [
            'lot',
            'breeding',
            'document',
            'campaign',
            'veterinarian',
            'medicalProduct',
        ];
        if (camelCaseEntities.includes(entityType)) {
            normalized = (0, case_converter_1.camelToSnake)(payload);
        }
        if (entityType === 'animal') {
            if (payload.farmId) {
                normalized.farm_id = payload.farmId;
                delete normalized.farmId;
            }
        }
        if (entityType === 'lot' && (payload.animalIds || normalized.animal_ids)) {
            normalized._animalIds = payload.animalIds || normalized.animal_ids;
            delete normalized.animal_ids;
        }
        if (entityType === 'campaign' && (payload.animalIds || normalized.animal_ids)) {
            const animalIdsArray = payload.animalIds || normalized.animal_ids;
            normalized.animal_ids_json = JSON.stringify(animalIdsArray);
            delete normalized.animal_ids;
        }
        normalized = this.convertEnums(entityType, normalized);
        delete normalized.synced;
        delete normalized.last_synced_at;
        delete normalized.server_version;
        return normalized;
    }
    convertEnums(entityType, payload) {
        switch (entityType) {
            case 'movement':
                if (payload.movement_type || payload.movementType) {
                    const typeField = payload.movement_type || payload.movementType;
                    payload.movement_type = (0, enum_converter_1.convertEnumValue)('movement_type', typeField);
                    delete payload.movementType;
                }
                if (payload.temporary_type || payload.temporaryType) {
                    const tempField = payload.temporary_type || payload.temporaryType;
                    payload.temporary_type = (0, enum_converter_1.convertEnumValue)('temporary_type', tempField);
                    delete payload.temporaryType;
                }
                break;
            case 'breeding':
                if (payload.method) {
                    payload.method = (0, enum_converter_1.convertEnumValue)('breeding_method', payload.method);
                }
                break;
            case 'document':
                if (payload.type) {
                    payload.type = (0, enum_converter_1.convertEnumValue)('document_type', payload.type);
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