"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingConfigService = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class LoggingConfigService {
    static instance;
    static getConfig() {
        if (!this.instance) {
            const logLevel = (process.env.LOG_LEVEL || 'info');
            this.instance = {
                level: logLevel,
                debugEnabled: logLevel === LogLevel.DEBUG,
                auditEnabled: true,
                errorEnabled: true,
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
    static isDebugEnabled() {
        return this.getConfig().debugEnabled;
    }
    static isAuditEnabled() {
        return this.getConfig().auditEnabled;
    }
    static isErrorEnabled() {
        return this.getConfig().errorEnabled;
    }
}
exports.LoggingConfigService = LoggingConfigService;
//# sourceMappingURL=logging.config.js.map