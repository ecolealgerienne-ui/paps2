// src/common/exceptions/business.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode, ERROR_CODES } from '../constants/error-codes';

/**
 * Exception lancée quand une règle métier est violée (400)
 *
 * Usage :
 * throw new BusinessRuleException(
 *   ERROR_CODES.ANIMAL_MUST_BE_FEMALE,
 *   'Mother must be female',
 *   { animalId: 'abc-123', gender: 'MALE' }
 * );
 */
export class BusinessRuleException extends BaseException {
  constructor(
    code: ErrorCode,
    message: string,
    context?: Record<string, any>,
  ) {
    super(code, message, HttpStatus.BAD_REQUEST, context);
  }
}
