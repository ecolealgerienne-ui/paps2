import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../interfaces/user.interface';
import { SecurityConfigService } from '../../common/config/security.config';
import { AppLogger } from '../../common/utils/logger.service';
import { BusinessRuleException } from '../../common/exceptions';
import { ERROR_CODES } from '../../common/constants/error-codes';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new AppLogger(AdminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      this.logger.warn('Admin guard: No user found in request');
      throw new BusinessRuleException(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication required',
      );
    }

    // ========================================
    // MODE MVP : Validation simplifiée
    // ========================================
    if (SecurityConfigService.isMvpMode()) {
      this.logger.debug('MVP Mode: Admin access granted by default', {
        userId: user.userId,
        roles: user.roles,
      });
      return true;
    }

    // ========================================
    // MODE PRODUCTION : Validation stricte
    // ========================================

    // Vérifier que l'utilisateur a le rôle admin ou super_admin
    const hasAdminRole = user.roles.includes('admin') || user.roles.includes('super_admin');

    if (!hasAdminRole) {
      this.logger.warn('Admin access denied', {
        userId: user.userId,
        roles: user.roles,
        path: request.path,
      });
      throw new BusinessRuleException(
        ERROR_CODES.FORBIDDEN,
        'Admin access required',
        {
          userId: user.userId,
          requiredRoles: ['admin', 'super_admin'],
          userRoles: user.roles,
        },
      );
    }

    this.logger.audit('Admin access granted', {
      userId: user.userId,
      role: user.roles.find(r => r === 'admin' || r === 'super_admin'),
    });

    return true;
  }
}
