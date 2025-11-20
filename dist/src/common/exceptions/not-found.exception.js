"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNotFoundException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const error_codes_1 = require("../constants/error-codes");
class EntityNotFoundException extends base_exception_1.BaseException {
    constructor(code = error_codes_1.ERROR_CODES.ENTITY_NOT_FOUND, message = 'Entity not found', context) {
        super(code, message, common_1.HttpStatus.NOT_FOUND, context);
    }
}
exports.EntityNotFoundException = EntityNotFoundException;
//# sourceMappingURL=not-found.exception.js.map