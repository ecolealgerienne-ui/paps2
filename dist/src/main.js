"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const interceptors_1 = require("./common/interceptors");
const filters_1 = require("./common/filters");
const security_config_1 = require("./common/config/security.config");
const logging_config_1 = require("./common/config/logging.config");
const logger_service_1 = require("./common/utils/logger.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: new logger_service_1.AppLogger('Bootstrap'),
    });
    const logger = new logger_service_1.AppLogger('Main');
    const securityConfig = security_config_1.SecurityConfigService.getConfig();
    const loggingConfig = logging_config_1.LoggingConfigService.getConfig();
    logger.log('🚀 Starting AniTra API...');
    app.useGlobalInterceptors(new interceptors_1.ResponseInterceptor());
    app.useGlobalFilters(new filters_1.HttpExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    if (securityConfig.cors.enabled) {
        app.enableCors({
            origin: securityConfig.cors.origins,
            credentials: securityConfig.cors.credentials,
        });
        logger.log('✅ CORS enabled');
    }
    if (securityConfig.helmet.enabled) {
        app.use((0, helmet_1.default)());
        logger.log('✅ Helmet security headers enabled');
    }
    else {
        logger.warn('⚠️  Helmet disabled (MVP mode)');
    }
    const config = new swagger_1.DocumentBuilder()
        .setTitle('AniTra API')
        .setDescription("API de gestion d'élevage")
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log('\n' + '='.repeat(60));
    console.log('🐄 AniTra Backend API');
    console.log('='.repeat(60));
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Mode: ${securityConfig.mvpMode ? 'MVP' : 'PRODUCTION'}`);
    console.log(`📝 Logging: ${loggingConfig.level.toUpperCase()}`);
    console.log(`🚀 API: http://localhost:${port}`);
    console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
    console.log('='.repeat(60) + '\n');
    logger.audit('API started successfully', {
        port,
        mode: securityConfig.mvpMode ? 'MVP' : 'PRODUCTION',
        logLevel: loggingConfig.level,
    });
}
void bootstrap();
//# sourceMappingURL=main.js.map