import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../interfaces/user.interface';

interface RequestWithUser extends Request {
  user: AuthUser;
  params: { farmId?: string };
  body: { farmId?: string };
  query: { farmId?: string };
}

@Injectable()
export class FarmGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const farmId =
      request.params.farmId || request.body.farmId || request.query.farmId;

    if (!farmId) {
      throw new ForbiddenException('farmId is required');
    }

    // Super admin peut accéder à toutes les fermes
    if (user.roles.includes('super_admin')) {
      return true;
    }

    // Vérifier que l'utilisateur a accès à cette ferme
    if (!user.farmIds.includes(farmId)) {
      throw new ForbiddenException('Access denied to this farm');
    }

    return true;
  }
}
