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
  params: { farmId?: string };
  body: { farmId?: string };
  query: { farmId?: string };
}

@Injectable()
export class FarmGuard implements CanActivate {
  private readonly logger = new AppLogger(FarmGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const farmId =
      request.params.farmId || request.body.farmId || request.query.farmId;

    // ========================================
    // Validation 1 : farmId requis
    // ========================================
    if (!farmId) {
      this.logger.warn('Request missing farmId', {
        userId: user?.userId,
        path: request.path,
      });
      throw new BusinessRuleException(
        ERROR_CODES.FARM_ID_REQUIRED,
        'farmId is required',
        { userId: user?.userId },
      );
    }

    // ========================================
    // MODE MVP : Validation désactivée
    // ========================================
    if (!SecurityConfigService.isFarmValidationEnabled()) {
      this.logger.debug('MVP Mode: Skipping farm access validation', {
        userId: user?.userId,
        farmId,
      });
      return true;
    }

    // ========================================
    // MODE PRODUCTION : Validation stricte
    // ========================================

    // Super admin peut accéder à toutes les fermes
    if (user.roles.includes('super_admin')) {
      this.logger.audit('Farm access granted (super_admin)', {
        userId: user.userId,
        farmId,
      });
      return true;
    }

    // Vérifier que l'utilisateur a accès à cette ferme
    if (!user.farmIds.includes(farmId)) {
      this.logger.warn('Farm access denied', {
        userId: user.userId,
        requestedFarmId: farmId,
        userFarmIds: user.farmIds,
      });
      throw new BusinessRuleException(
        ERROR_CODES.FARM_ACCESS_DENIED,
        'Access denied to this farm',
        {
          userId: user.userId,
          farmId,
        },
      );
    }

    this.logger.audit('Farm access granted', {
      userId: user.userId,
      farmId,
    });

    return true;
  }
}
