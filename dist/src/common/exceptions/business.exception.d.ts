import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';
export declare class BusinessRuleException extends BaseException {
    constructor(code: ErrorCode, message: string, context?: Record<string, any>);
}
