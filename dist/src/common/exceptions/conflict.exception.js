"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityConflictException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const error_codes_1 = require("../constants/error-codes");
class EntityConflictException extends base_exception_1.BaseException {
    constructor(code = error_codes_1.ERROR_CODES.VERSION_CONFLICT, message = 'Conflict detected', context) {
        super(code, message, common_1.HttpStatus.CONFLICT, context);
    }
}
exports.EntityConflictException = EntityConflictException;
//# sourceMappingURL=conflict.exception.js.map