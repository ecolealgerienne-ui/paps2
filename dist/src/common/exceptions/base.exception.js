"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseException = void 0;
const common_1 = require("@nestjs/common");
class BaseException extends common_1.HttpException {
    code;
    timestamp;
    context;
    constructor(code, message, statusCode, context) {
        super({
            code,
            message,
            timestamp: new Date().toISOString(),
            ...(context && { context }),
        }, statusCode);
        this.code = code;
        this.timestamp = new Date().toISOString();
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }
    getResponse() {
        return super.getResponse();
    }
}
exports.BaseException = BaseException;
//# sourceMappingURL=base.exception.js.map