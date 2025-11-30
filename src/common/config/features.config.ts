// src/common/config/features.config.ts

export interface FeaturesConfig {
  rateLimit: {
    enabled: boolean;
    limits: {
      short: { ttl: number; limit: number };
      medium: { ttl: number; limit: number };
      long: { ttl: number; limit: number };
    };
  };
  httpLogging: {
    enabled: boolean;
    logRequestBody: boolean;
    logResponseBody: boolean;
  };
  compression: {
    enabled: boolean;
    level: number;
  };
  requestId: {
    enabled: boolean;
    headerName: string;
  };
  healthCheck: {
    enabled: boolean;
  };
  requestTimeout: {
    enabled: boolean;
    timeoutMs: number;
  };
  xssProtection: {
    enabled: boolean;
  };
  metrics: {
    enabled: boolean;
    path: string;
  };
}

export class FeaturesConfigService {
  private static instance: FeaturesConfig;

  static getConfig(): FeaturesConfig {
    if (!this.instance) {
      const isProd = process.env.NODE_ENV === 'production';
      const mvpMode = process.env.MVP_MODE === 'true';

      this.instance = {
        rateLimit: {
          // Can be disabled with RATE_LIMIT_ENABLED=false (useful for seed scripts)
          enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
          limits: {
            short: {
              ttl: parseInt(process.env.RATE_LIMIT_SHORT_TTL || '1000'),
              limit: parseInt(
                process.env.RATE_LIMIT_SHORT_LIMIT || (isProd ? '50' : '1000'),
              ),
            },
            medium: {
              ttl: parseInt(process.env.RATE_LIMIT_MEDIUM_TTL || '10000'),
              limit: parseInt(
                process.env.RATE_LIMIT_MEDIUM_LIMIT ||
                  (isProd ? '200' : '5000'),
              ),
            },
            long: {
              ttl: parseInt(process.env.RATE_LIMIT_LONG_TTL || '60000'),
              limit: parseInt(
                process.env.RATE_LIMIT_LONG_LIMIT ||
                  (isProd ? '500' : '30000'),
              ),
            },
          },
        },

        httpLogging: {
          enabled: process.env.HTTP_LOGGING_ENABLED === 'true',
          logRequestBody: process.env.HTTP_LOG_REQUEST_BODY === 'true',
          logResponseBody: process.env.HTTP_LOG_RESPONSE_BODY === 'true',
        },

        compression: {
          // Enabled by default, can be disabled with COMPRESSION_ENABLED=false
          enabled: process.env.COMPRESSION_ENABLED !== 'false',
          level: parseInt(process.env.COMPRESSION_LEVEL || '6'),
        },

        requestId: {
          // Enabled by default, can be disabled with REQUEST_ID_ENABLED=false
          enabled: process.env.REQUEST_ID_ENABLED !== 'false',
          headerName: process.env.REQUEST_ID_HEADER || 'X-Request-ID',
        },

        healthCheck: {
          // Enabled by default, can be disabled with HEALTH_CHECK_ENABLED=false
          enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
        },

        requestTimeout: {
          enabled: process.env.REQUEST_TIMEOUT_ENABLED === 'true',
          timeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000'),
        },

        xssProtection: {
          // Enabled in production mode by default
          enabled:
            !mvpMode &&
            process.env.XSS_PROTECTION_ENABLED !== 'false',
        },

        metrics: {
          enabled: process.env.METRICS_ENABLED === 'true',
          path: process.env.METRICS_PATH || '/metrics',
        },
      };

      console.log('🎛️  Features Configuration:', {
        rateLimit: this.instance.rateLimit.enabled ? 'enabled' : 'disabled',
        httpLogging: this.instance.httpLogging.enabled
          ? 'enabled'
          : 'disabled',
        compression: this.instance.compression.enabled
          ? 'enabled'
          : 'disabled',
        requestId: this.instance.requestId.enabled ? 'enabled' : 'disabled',
        healthCheck: this.instance.healthCheck.enabled
          ? 'enabled'
          : 'disabled',
        requestTimeout: this.instance.requestTimeout.enabled
          ? 'enabled'
          : 'disabled',
        xssProtection: this.instance.xssProtection.enabled
          ? 'enabled'
          : 'disabled',
        metrics: this.instance.metrics.enabled ? 'enabled' : 'disabled',
      });
    }

    return this.instance;
  }

  static isRateLimitEnabled(): boolean {
    return this.getConfig().rateLimit.enabled;
  }

  static getRateLimitConfig() {
    return this.getConfig().rateLimit;
  }

  static isHttpLoggingEnabled(): boolean {
    return this.getConfig().httpLogging.enabled;
  }

  static getHttpLoggingConfig() {
    return this.getConfig().httpLogging;
  }

  static isCompressionEnabled(): boolean {
    return this.getConfig().compression.enabled;
  }

  static getCompressionConfig() {
    return this.getConfig().compression;
  }

  static isRequestIdEnabled(): boolean {
    return this.getConfig().requestId.enabled;
  }

  static getRequestIdConfig() {
    return this.getConfig().requestId;
  }

  static isHealthCheckEnabled(): boolean {
    return this.getConfig().healthCheck.enabled;
  }

  static isRequestTimeoutEnabled(): boolean {
    return this.getConfig().requestTimeout.enabled;
  }

  static getRequestTimeoutConfig() {
    return this.getConfig().requestTimeout;
  }

  static isXssProtectionEnabled(): boolean {
    return this.getConfig().xssProtection.enabled;
  }

  static isMetricsEnabled(): boolean {
    return this.getConfig().metrics.enabled;
  }

  static getMetricsConfig() {
    return this.getConfig().metrics;
  }
}
