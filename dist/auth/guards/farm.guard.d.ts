import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class FarmGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
