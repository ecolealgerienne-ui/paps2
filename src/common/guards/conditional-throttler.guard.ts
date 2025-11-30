// src/common/guards/conditional-throttler.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FeaturesConfigService } from '../config/features.config';

/**
 * Conditional Throttler Guard
 *
 * Extends the standard ThrottlerGuard to allow disabling rate limiting
 * via environment variables.
 *
 * If RATE_LIMIT_ENABLED=false, this guard will be bypassed entirely.
 * Useful for:
 * - Seed scripts that make many requests
 * - Migration scripts
 * - Development/testing environments
 *
 * Usage:
 * Set RATE_LIMIT_ENABLED=false in .env to disable rate limiting
 */
@Injectable()
export class ConditionalThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if rate limiting is enabled
    if (!FeaturesConfigService.isRateLimitEnabled()) {
      // Rate limiting disabled - allow all requests
      return true;
    }

    // Rate limiting enabled - use standard throttler logic
    return super.canActivate(context);
  }
}
