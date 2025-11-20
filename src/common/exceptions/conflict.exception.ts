// src/common/exceptions/conflict.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode, ERROR_CODES } from '../constants/error-codes';

/**
 * Exception lancée en cas de conflit de version (optimistic locking) ou duplication (409)
 *
 * Usage :
 * throw new EntityConflictException(
 *   ERROR_CODES.VERSION_CONFLICT,
 *   'Version conflict detected',
 *   {
 *     entityId: 'abc-123',
 *     clientVersion: 2,
 *     serverVersion: 3
 *   }
 * );
 */
export class EntityConflictException extends BaseException {
  constructor(
    code: ErrorCode = ERROR_CODES.VERSION_CONFLICT,
    message: string = 'Conflict detected',
    context?: Record<string, any>,
  ) {
    super(code, message, HttpStatus.CONFLICT, context);
  }
}
