import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../interfaces/user.interface';
import { SecurityConfigService } from '../../common/config/security.config';
import { AppLogger } from '../../common/utils/logger.service';
import { BusinessRuleException } from '../../common/exceptions';
import { ERROR_CODES } from '../../common/constants/error-codes';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new AppLogger(AuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // ========================================
    // MODE MVP : Authentification simulée
    // ========================================
    if (SecurityConfigService.isMvpMode()) {
      this.logger.debug('MVP Mode: Using fake dev user');

      const devUser: AuthUser = {
        userId: 'dev-user-001',
        email: 'dev@anitra.dz',
        farmIds: ['550e8400-e29b-41d4-a716-446655440000'], // UUID
        defaultFarmId: '550e8400-e29b-41d4-a716-446655440000', // UUID
        roles: ['farm_owner'],
      };

      (request as Request & { user: AuthUser }).user = devUser;

      this.logger.audit('User authenticated (MVP mode)', {
        userId: devUser.userId,
        farmIds: devUser.farmIds,
      });

      return true;
    }

    // ========================================
    // MODE PRODUCTION : Validation JWT
    // ========================================
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Missing or invalid Authorization header');
      throw new BusinessRuleException(
        ERROR_CODES.UNAUTHORIZED,
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
      // TODO PRODUCTION : Implémenter la validation JWT
      // const decoded = this.jwtService.verify(token);
      // const user = await this.loadUserFromToken(decoded);
      //
      // (request as Request & { user: AuthUser }).user = user;
      //
      // this.logger.audit('User authenticated (JWT)', {
      //   userId: user.userId,
      //   farmIds: user.farmIds,
      // });

      // Stub temporaire pour la migration
      this.logger.warn('JWT validation not implemented yet - rejecting request');
      throw new BusinessRuleException(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication not configured',
      );
    } catch (error) {
      this.logger.error('JWT validation failed', error.stack);
      throw new BusinessRuleException(
        ERROR_CODES.INVALID_TOKEN,
        'Invalid or expired token',
      );
    }
  }
}
