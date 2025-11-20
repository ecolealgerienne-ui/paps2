import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class FarmGuard implements CanActivate {
    private readonly logger;
    canActivate(context: ExecutionContext): boolean;
}
