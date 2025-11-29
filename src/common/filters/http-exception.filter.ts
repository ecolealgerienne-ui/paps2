import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseException } from '../exceptions';
import { AppLogger } from '../utils/logger.service';
import { ERROR_CODES, ErrorCode } from '../constants/error-codes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLogger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
    let errors: any = null;
    let context: any = null;

    // Cas 1 : Exception personnalisée (BaseException)
    if (exception instanceof BaseException) {
      status = exception.getStatus();
      code = exception.code;
      message = exception.message;
      context = exception.context;

      // Log en fonction de la sévérité
      if (status >= 500) {
        this.logger.error(
          `${code} | ${message}`,
          exception.stack,
          HttpExceptionFilter.name,
        );
      } else if (status >= 400) {
        this.logger.warn(`${code} | ${message}`, HttpExceptionFilter.name);
      }
    }
    // Cas 2 : Exception NestJS standard (HttpException)
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        errors = responseObj.errors || null;
        code = responseObj.code || ERROR_CODES.INTERNAL_SERVER_ERROR;

        // Validation errors de class-validator
        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          errors = responseObj.message;
          code = ERROR_CODES.VALIDATION_FAILED;
        }
      }

      // Log validation errors with full details
      if (errors) {
        this.logger.warn(
          `HTTP ${status} | ${message} | Errors: ${JSON.stringify(errors)}`,
          HttpExceptionFilter.name,
        );
      } else {
        this.logger.error(
          `HTTP ${status} | ${message}`,
          exception.stack,
          HttpExceptionFilter.name,
        );
      }
    }
    // Cas 3 : Exception JS standard
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled error | ${message}`,
        exception.stack,
        HttpExceptionFilter.name,
      );
    }
    // Cas 4 : Exception inconnue
    else {
      this.logger.error(
        `Unknown exception type | ${String(exception)}`,
        undefined,
        HttpExceptionFilter.name,
      );
    }

    // Réponse standardisée pour le client
    response.status(status).json({
      success: false,
      error: {
        code, // Pour la traduction côté mobile
        statusCode: status,
        message,
        ...(errors && { errors }), // Erreurs de validation
        ...(context && { context }), // Contexte métier
      },
      timestamp: new Date().toISOString(),
    });
  }
}
