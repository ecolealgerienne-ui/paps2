export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export interface LoggingConfig {
    level: LogLevel;
    debugEnabled: boolean;
    auditEnabled: boolean;
    errorEnabled: boolean;
}
export declare class LoggingConfigService {
    private static instance;
    static getConfig(): LoggingConfig;
    static isDebugEnabled(): boolean;
    static isAuditEnabled(): boolean;
    static isErrorEnabled(): boolean;
}
