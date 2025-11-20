"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
const logging_config_1 = require("../config/logging.config");
class AppLogger extends common_1.Logger {
    debug(message, data) {
        if (logging_config_1.LoggingConfigService.isDebugEnabled()) {
            const logMessage = data
                ? `${message} | ${JSON.stringify(data)}`
                : message;
            super.debug(logMessage, this.context);
        }
    }
    audit(message, data) {
        if (logging_config_1.LoggingConfigService.isAuditEnabled()) {
            const logMessage = data
                ? `${message} | ${JSON.stringify(data)}`
                : message;
            super.log(logMessage, this.context);
        }
    }
    error(message, trace, context) {
        if (logging_config_1.LoggingConfigService.isErrorEnabled()) {
            super.error(message, trace, context || this.context);
        }
    }
    warn(message, data) {
        const logMessage = data
            ? `${message} | ${JSON.stringify(data)}`
            : message;
        super.warn(logMessage, this.context);
    }
    log(message, data) {
        const logMessage = data
            ? `${message} | ${JSON.stringify(data)}`
            : message;
        super.log(logMessage, this.context);
    }
}
exports.AppLogger = AppLogger;
//# sourceMappingURL=logger.service.js.map