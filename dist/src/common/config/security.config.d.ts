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
export declare class SecurityConfigService {
    private static instance;
    static getConfig(): SecurityConfig;
    static isMvpMode(): boolean;
    static isJwtEnabled(): boolean;
    static isHelmetEnabled(): boolean;
    static isXssProtectionEnabled(): boolean;
    static isFarmValidationEnabled(): boolean;
}
