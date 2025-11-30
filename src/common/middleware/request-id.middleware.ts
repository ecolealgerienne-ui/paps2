// src/common/middleware/request-id.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FeaturesConfigService } from '../config/features.config';

/**
 * Request ID Middleware
 *
 * Generates or forwards a unique request ID for each HTTP request.
 * The request ID can be used to trace a single request through logs.
 *
 * Header precedence:
 * 1. Uses existing X-Request-ID from client if present
 * 2. Generates a new UUID v4 if not present
 *
 * The request ID is:
 * - Attached to the request object (req.id)
 * - Added to response headers (X-Request-ID)
 * - Available for logging throughout the request lifecycle
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const config = FeaturesConfigService.getRequestIdConfig();

    // Get or generate request ID
    const requestId = req.headers[config.headerName.toLowerCase()] as string || uuidv4();

    // Attach to request object for use in logging
    (req as any).id = requestId;

    // Add to response headers
    res.setHeader(config.headerName, requestId);

    next();
  }
}
