"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
class BusinessRuleException extends base_exception_1.BaseException {
    constructor(code, message, context) {
        super(code, message, common_1.HttpStatus.BAD_REQUEST, context);
    }
}
exports.BusinessRuleException = BusinessRuleException;
//# sourceMappingURL=business.exception.js.map