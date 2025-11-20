// src/common/utils/logger.service.ts

import { ConsoleLogger } from '@nestjs/common';
import { LoggingConfigService } from '../config/logging.config';

export class AppLogger extends ConsoleLogger {
  /**
   * Logs de DEBUG : détails techniques (activable/désactivable)
   * Usage : Développement uniquement
   * Exemple : "Creating animal with data: {...}"
   */
  debug(message: string, data?: any) {
    if (LoggingConfigService.isDebugEnabled()) {
      const logMessage = data
        ? `${message} | ${JSON.stringify(data)}`
        : message;
      super.debug(logMessage, this.context);
    }
  }

  /**
   * Logs MÉTIER : opérations normales (TOUJOURS actif)
   * Usage : Audit trail, comprendre l'usage de l'app
   * Exemple : "Animal created | {animalId, farmId, userId}"
   */
  audit(message: string, data?: any) {
    if (LoggingConfigService.isAuditEnabled()) {
      const logMessage = data
        ? `${message} | ${JSON.stringify(data)}`
        : message;
      super.log(logMessage, this.context);
    }
  }

  /**
   * Logs d'ERREUR : erreurs techniques (TOUJOURS actif)
   * Usage : Debugging, alerting
   * Exemple : "Failed to create animal: Database connection lost"
   */
  error(message: string, trace?: string, context?: string) {
    if (LoggingConfigService.isErrorEnabled()) {
      super.error(message, trace, context || this.context);
    }
  }

  /**
   * Logs d'AVERTISSEMENT : situations anormales mais non bloquantes
   * Exemple : "Version conflict for animal abc-123"
   */
  warn(message: string, data?: any) {
    const logMessage = data
      ? `${message} | ${JSON.stringify(data)}`
      : message;
    super.warn(logMessage, this.context);
  }

  /**
   * Logs INFO : opérations importantes
   * Exemple : "Sync completed: 25 items processed"
   */
  log(message: string, data?: any) {
    const logMessage = data
      ? `${message} | ${JSON.stringify(data)}`
      : message;
    super.log(logMessage, this.context);
  }
}
