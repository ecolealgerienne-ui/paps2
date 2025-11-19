import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../interfaces/user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Mode DEV : utilisateur simulé
    const devUser: AuthUser = {
      userId: 'dev-user-001',
      email: 'dev@anitra.dz',
      farmIds: ['550e8400-e29b-41d4-a716-446655440000'], // UUID
      defaultFarmId: '550e8400-e29b-41d4-a716-446655440000', // UUID
      roles: ['farm_owner'],
    };

    (request as Request & { user: AuthUser }).user = devUser;

    return true;
  }
}
