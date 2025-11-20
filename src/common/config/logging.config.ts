// src/common/config/logging.config.ts

export enum LogLevel {
  DEBUG = 'debug',   // Détails techniques (désactivable)
  INFO = 'info',     // Opérations normales (audit)
  WARN = 'warn',     // Avertissements
  ERROR = 'error',   // Erreurs
}

export interface LoggingConfig {
  level: LogLevel;
  debugEnabled: boolean;
  auditEnabled: boolean;
  errorEnabled: boolean;
}

export class LoggingConfigService {
  private static instance: LoggingConfig;

  static getConfig(): LoggingConfig {
    if (!this.instance) {
      const logLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;

      this.instance = {
        level: logLevel,
        debugEnabled: logLevel === LogLevel.DEBUG,
        auditEnabled: true,  // TOUJOURS actif
        errorEnabled: true,  // TOUJOURS actif
      };

      console.log('📝 Logging Configuration:', {
        level: logLevel,
        debug: this.instance.debugEnabled ? 'enabled' : 'disabled',
        audit: 'always enabled',
        error: 'always enabled',
      });
    }

    return this.instance;
  }

  static isDebugEnabled(): boolean {
    return this.getConfig().debugEnabled;
  }

  static isAuditEnabled(): boolean {
    return this.getConfig().auditEnabled;
  }

  static isErrorEnabled(): boolean {
    return this.getConfig().errorEnabled;
  }
}
