// src/common/middleware/http-logger.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../utils/logger.service';
import { FeaturesConfigService } from '../config/features.config';

/**
 * HTTP Logging Middleware
 *
 * Logs all incoming HTTP requests and their responses.
 * Configurable via environment variables:
 * - HTTP_LOGGING_ENABLED: Enable/disable HTTP logging
 * - HTTP_LOG_REQUEST_BODY: Include request body in logs
 * - HTTP_LOG_RESPONSE_BODY: Include response body in logs
 *
 * Logs include:
 * - Request method, path, query params
 * - Response status code
 * - Request duration in milliseconds
 * - Request ID (if available)
 * - Optional: Request/Response bodies
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new AppLogger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const config = FeaturesConfigService.getHttpLoggingConfig();

    const startTime = Date.now();
    const { method, originalUrl, query, body } = req;
    const requestId = (req as any).id || 'unknown';

    // Log request
    const requestLog: any = {
      requestId,
      method,
      url: originalUrl,
    };

    if (Object.keys(query).length > 0) {
      requestLog.query = query;
    }

    if (config.logRequestBody && body && Object.keys(body).length > 0) {
      requestLog.body = body;
    }

    this.logger.debug('Incoming request', requestLog);

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const responseLog: any = {
        requestId,
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
      };

      // Log with appropriate level based on status code
      if (statusCode >= 500) {
        this.logger.error('Request failed', responseLog);
      } else if (statusCode >= 400) {
        this.logger.warn('Request error', responseLog);
      } else {
        this.logger.log('Request completed', responseLog);
      }
    });

    next();
  }
}
