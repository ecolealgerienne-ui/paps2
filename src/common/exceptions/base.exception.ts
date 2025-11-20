// src/common/exceptions/base.exception.ts

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';

/**
 * Classe de base pour toutes les exceptions personnalisées
 * Permet de standardiser la structure des erreurs avec des codes machine-readable
 */
export abstract class BaseException extends HttpException {
  public readonly code: ErrorCode;
  public readonly timestamp: string;
  public readonly context?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: HttpStatus,
    context?: Record<string, any>,
  ) {
    super(
      {
        code,
        message,
        timestamp: new Date().toISOString(),
        ...(context && { context }),
      },
      statusCode,
    );

    this.code = code;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // Maintenir la stack trace propre
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Retourne la réponse formatée pour le client
   */
  getResponse(): {
    code: ErrorCode;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
  } {
    return super.getResponse() as any;
  }
}
