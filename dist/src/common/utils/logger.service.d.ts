import { Logger as NestLogger } from '@nestjs/common';
export declare class AppLogger extends NestLogger {
    debug(message: string, data?: any): void;
    audit(message: string, data?: any): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, data?: any): void;
    log(message: string, data?: any): void;
}
