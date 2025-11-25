// src/common/config/security.config.ts

export interface SecurityConfig {
  mvpMode: boolean;
  jwt: {
    enabled: boolean;
    secret?: string;
    expiresIn: string;
  };
  cors: {
    enabled: boolean;
    origins: string[] | boolean;
    credentials: boolean;
  };
  helmet: {
    enabled: boolean;
  };
  xss: {
    enabled: boolean;
  };
  farmValidation: {
    enabled: boolean;
  };
}

export class SecurityConfigService {
  private static instance: SecurityConfig;

  static getConfig(): SecurityConfig {
    if (!this.instance) {
      const mvpMode = process.env.MVP_MODE === 'true';

      // SECURITY: Prevent MVP mode from being enabled in production
      if (mvpMode && process.env.NODE_ENV === 'production') {
        throw new Error(
          '🚨 SECURITY ERROR: MVP_MODE cannot be enabled in production! ' +
          'Set MVP_MODE=false or remove NODE_ENV=production.'
        );
      }

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
            ? true // MVP : tous les origins
            : (process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']),
          credentials: true,
        },

        helmet: {
          enabled: !mvpMode, // Activé uniquement en prod
        },

        xss: {
          enabled: !mvpMode, // Activé uniquement en prod
        },

        farmValidation: {
          enabled: !mvpMode, // Validation stricte en prod uniquement
        },
      };

      // Log la configuration au démarrage
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

  static isMvpMode(): boolean {
    return this.getConfig().mvpMode;
  }

  static isJwtEnabled(): boolean {
    return this.getConfig().jwt.enabled;
  }

  static isHelmetEnabled(): boolean {
    return this.getConfig().helmet.enabled;
  }

  static isXssProtectionEnabled(): boolean {
    return this.getConfig().xss.enabled;
  }

  static isFarmValidationEnabled(): boolean {
    return this.getConfig().farmValidation.enabled;
  }
}
