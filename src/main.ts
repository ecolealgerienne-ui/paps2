import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors';
import { HttpExceptionFilter } from './common/filters';
import { RequestIdMiddleware, HttpLoggerMiddleware } from './common/middleware';
import { SecurityConfigService } from './common/config/security.config';
import { LoggingConfigService } from './common/config/logging.config';
import { FeaturesConfigService } from './common/config/features.config';
import { AppLogger } from './common/utils/logger.service';

async function bootstrap() {
  // ========================================
  // 1. INITIALISATION
  // ========================================
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger('Bootstrap'),
  });

  const logger = new AppLogger('Main');
  const securityConfig = SecurityConfigService.getConfig();
  const loggingConfig = LoggingConfigService.getConfig();
  const featuresConfig = FeaturesConfigService.getConfig();

  logger.log('🚀 Starting AniTra API...');

  // ========================================
  // 1.5. MIDDLEWARE
  // ========================================
  // Request ID tracking (must be first to track all requests)
  if (featuresConfig.requestId.enabled) {
    const requestIdMiddleware = new RequestIdMiddleware();
    app.use((req, res, next) => requestIdMiddleware.use(req, res, next));
    logger.log('✅ Request ID tracking enabled');
  }

  // HTTP request/response logging
  if (featuresConfig.httpLogging.enabled) {
    const httpLoggerMiddleware = new HttpLoggerMiddleware();
    app.use((req, res, next) => httpLoggerMiddleware.use(req, res, next));
    logger.log('✅ HTTP logging enabled');
  }

  // Compression (gzip)
  if (featuresConfig.compression.enabled) {
    app.use(compression({ level: featuresConfig.compression.level }));
    logger.log('✅ Compression enabled');
  }

  // ========================================
  // 2. INTERCEPTORS & FILTERS
  // ========================================
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // ========================================
  // 3. VALIDATION
  // ========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ========================================
  // 4. SECURITY - CORS
  // ========================================
  if (securityConfig.cors.enabled) {
    app.enableCors({
      origin: securityConfig.cors.origins,
      credentials: securityConfig.cors.credentials,
    });
    logger.log('✅ CORS enabled');
  }

  // ========================================
  // 5. SECURITY - HELMET (Production uniquement)
  // ========================================
  if (securityConfig.helmet.enabled) {
    app.use(helmet());
    logger.log('✅ Helmet security headers enabled');
  } else {
    logger.warn('⚠️  Helmet disabled (MVP mode)');
  }

  // ========================================
  // 6. SWAGGER API DOCS
  // ========================================
  const config = new DocumentBuilder()
    .setTitle('AniTra API')
    .setDescription("API de gestion d'élevage")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ========================================
  // 7. DÉMARRAGE
  // ========================================
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // ========================================
  // 8. LOGS DE DÉMARRAGE
  // ========================================
  console.log('\n' + '='.repeat(60));
  console.log('🐄 AniTra Backend API');
  console.log('='.repeat(60));
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Mode: ${securityConfig.mvpMode ? 'MVP' : 'PRODUCTION'}`);
  console.log(`📝 Logging: ${loggingConfig.level.toUpperCase()}`);
  console.log(`🚀 API: http://localhost:${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health: http://localhost:${port}/health`);
  console.log('='.repeat(60) + '\n');

  logger.audit('API started successfully', {
    port,
    mode: securityConfig.mvpMode ? 'MVP' : 'PRODUCTION',
    logLevel: loggingConfig.level,
  });
}

void bootstrap();
