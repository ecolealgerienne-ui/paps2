import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';
export declare abstract class BaseException extends HttpException {
    readonly code: ErrorCode;
    readonly timestamp: string;
    readonly context?: Record<string, any>;
    constructor(code: ErrorCode, message: string, statusCode: HttpStatus, context?: Record<string, any>);
    getResponse(): {
        code: ErrorCode;
        message: string;
        timestamp: string;
        context?: Record<string, any>;
    };
}
