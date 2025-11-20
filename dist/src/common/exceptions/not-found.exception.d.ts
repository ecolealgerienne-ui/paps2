import { BaseException } from './base.exception';
import { ErrorCode } from '../constants/error-codes';
export declare class EntityNotFoundException extends BaseException {
    constructor(code?: ErrorCode, message?: string, context?: Record<string, any>);
}
