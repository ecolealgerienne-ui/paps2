"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENUM_MAPPINGS = void 0;
exports.convertEnumValue = convertEnumValue;
exports.convertEnumValueReverse = convertEnumValueReverse;
exports.ENUM_MAPPINGS = {
    movement_type: {
        'temporaryOut': 'temporary_out',
        'temporaryReturn': 'temporary_return',
        'birth': 'birth',
        'purchase': 'purchase',
        'sale': 'sale',
        'death': 'death',
        'slaughter': 'slaughter',
        'exit': 'exit',
        'entry': 'entry',
    },
    breeding_method: {
        'natural': 'natural',
        'artificialInsemination': 'artificial_insemination',
        'embryoTransfer': 'embryo_transfer',
    },
    document_type: {
        'passport': 'passport',
        'certificate': 'certificate',
        'invoice': 'invoice',
        'transportCert': 'transport_cert',
        'breedingCert': 'breeding_cert',
        'vetReport': 'vet_report',
        'other': 'other',
    },
    animal_status: {
        'draft': 'draft',
        'alive': 'alive',
        'sold': 'sold',
        'dead': 'dead',
        'slaughtered': 'slaughtered',
        'onTemporaryMovement': 'on_temporary_movement',
    },
    temporary_type: {
        'loan': 'loan',
        'transhumance': 'transhumance',
        'boarding': 'boarding',
        'quarantine': 'quarantine',
        'exhibition': 'exhibition',
    },
};
function convertEnumValue(enumType, value) {
    if (!value)
        return value;
    const mapping = exports.ENUM_MAPPINGS[enumType];
    return mapping[value] || value;
}
function convertEnumValueReverse(enumType, value) {
    if (!value)
        return value;
    const mapping = exports.ENUM_MAPPINGS[enumType];
    for (const [camelKey, snakeValue] of Object.entries(mapping)) {
        if (snakeValue === value) {
            return camelKey;
        }
    }
    return value;
}
//# sourceMappingURL=enum-converter.js.map