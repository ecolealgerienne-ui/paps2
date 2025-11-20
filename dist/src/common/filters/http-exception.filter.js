"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../exceptions");
const logger_service_1 = require("../utils/logger.service");
const error_codes_1 = require("../constants/error-codes");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new logger_service_1.AppLogger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = error_codes_1.ERROR_CODES.INTERNAL_SERVER_ERROR;
        let errors = null;
        let context = null;
        if (exception instanceof exceptions_1.BaseException) {
            status = exception.getStatus();
            code = exception.code;
            message = exception.message;
            context = exception.context;
            if (status >= 500) {
                this.logger.error(`${code} | ${message}`, exception.stack, HttpExceptionFilter_1.name);
            }
            else if (status >= 400) {
                this.logger.warn(`${code} | ${message}`, HttpExceptionFilter_1.name);
            }
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse;
                message = responseObj.message || exception.message;
                errors = responseObj.errors || null;
                code = responseObj.code || error_codes_1.ERROR_CODES.INTERNAL_SERVER_ERROR;
                if (Array.isArray(responseObj.message)) {
                    message = 'Validation failed';
                    errors = responseObj.message;
                    code = error_codes_1.ERROR_CODES.VALIDATION_FAILED;
                }
            }
            this.logger.error(`HTTP ${status} | ${message}`, exception.stack, HttpExceptionFilter_1.name);
        }
        else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`Unhandled error | ${message}`, exception.stack, HttpExceptionFilter_1.name);
        }
        else {
            this.logger.error(`Unknown exception type | ${String(exception)}`, undefined, HttpExceptionFilter_1.name);
        }
        response.status(status).json({
            success: false,
            error: {
                code,
                statusCode: status,
                message,
                ...(errors && { errors }),
                ...(context && { context }),
            },
            timestamp: new Date().toISOString(),
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map