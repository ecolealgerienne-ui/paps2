"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityConfigService = void 0;
class SecurityConfigService {
    static instance;
    static getConfig() {
        if (!this.instance) {
            const mvpMode = process.env.MVP_MODE === 'true';
            this.instance = {
                mvpMode,
                jwt: {
                    enabled: !mvpMode,
                    secret: process.env.JWT_SECRET,
                    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
                },
                cors: {
                    enabled: true,
                    origins: mvpMode
                        ? true
                        : (process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']),
                    credentials: true,
                },
                helmet: {
                    enabled: !mvpMode,
                },
                xss: {
                    enabled: !mvpMode,
                },
                farmValidation: {
                    enabled: !mvpMode,
                },
            };
            console.log('🔒 Security Configuration:', {
                mode: mvpMode ? 'MVP' : 'PRODUCTION',
                jwt: this.instance.jwt.enabled ? 'enabled' : 'disabled',
                cors: this.instance.cors.enabled ? 'enabled' : 'disabled',
                helmet: this.instance.helmet.enabled ? 'enabled' : 'disabled',
                xss: this.instance.xss.enabled ? 'enabled' : 'disabled',
                farmValidation: this.instance.farmValidation.enabled ? 'enabled' : 'disabled',
            });
        }
        return this.instance;
    }
    static isMvpMode() {
        return this.getConfig().mvpMode;
    }
    static isJwtEnabled() {
        return this.getConfig().jwt.enabled;
    }
    static isHelmetEnabled() {
        return this.getConfig().helmet.enabled;
    }
    static isXssProtectionEnabled() {
        return this.getConfig().xss.enabled;
    }
    static isFarmValidationEnabled() {
        return this.getConfig().farmValidation.enabled;
    }
}
exports.SecurityConfigService = SecurityConfigService;
//# sourceMappingURL=security.config.js.map