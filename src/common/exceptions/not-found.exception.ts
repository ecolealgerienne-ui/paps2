// src/common/exceptions/not-found.exception.ts

import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode, ERROR_CODES } from '../constants/error-codes';

/**
 * Exception lancée quand une entité n'est pas trouvée (404)
 *
 * Usage :
 * throw new EntityNotFoundException(
 *   ERROR_CODES.ANIMAL_NOT_FOUND,
 *   'Animal not found',
 *   { animalId: 'abc-123', farmId: 'farm-456' }
 * );
 */
export class EntityNotFoundException extends BaseException {
  constructor(
    code: ErrorCode = ERROR_CODES.ENTITY_NOT_FOUND,
    message: string = 'Entity not found',
    context?: Record<string, any>,
  ) {
    super(code, message, HttpStatus.NOT_FOUND, context);
  }
}
